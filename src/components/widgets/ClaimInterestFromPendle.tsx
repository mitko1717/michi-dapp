import React, {useEffect, useState} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from "@nextui-org/react";
import {Wallet} from "../../types/wallet";
import {simulateContract} from "@wagmi/core";
import {useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt} from "wagmi";
import PendleYieldTokenAbi, {ActionMiscV3Abi} from "../../abis/pendle";
import {encodeFunctionData, formatEther} from "viem";
import {Token} from "../../types/token";
import axios from "axios";
import {chainIdToHex, formatBalance} from "../../utils/formatters";
import {NumOfConfirmationsToWaitFor, WagmiConfig} from "../../config/wagmi.config";
import {toast} from "sonner";
import {initializeTokenboundClient} from "../../hooks/useTokenboundClient";
import {ChainId} from "../../types/chain";
import {WalletClientError} from "../../types/errors";

const ClaimInterestFromPendle = ({wallet}: { wallet: Wallet }) => {

    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<Token[]>([]);

    const chainId = useChainId();

    useEffect(() => {
        setBalance([]);
        const fetchTokenBalance = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/tokens/${chainIdToHex(chainId)}/${wallet.walletAddress}`);
                const _cleanData = response?.data?.filter((token: Token) => Number(token?.balance) !== 0);
                setBalance(_cleanData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTokenBalance();
    }, [chainId, wallet]);

    return (
        <div className="pichi-card p-6 h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between mb-6">
                <span className="text-xl font-semibold max-w-64">Claim interest from Pendle</span>
                <img src="/assets/logos/pendle.png" alt="Pendle Logo" className="h-12"/>
            </div>
                <ClaimYTYield depositedTokens={balance} wallet={wallet}/>
            </div>
        </div>
    );
};
type Props = {
    depositedTokens: any;
    wallet: Wallet;
};
const ClaimYTYield: React.FC<Props> = ({ depositedTokens, wallet }) => {
    const pendleRouterV3Address = '0x00000000005bbb0ef59571e58418f9a4357b68a0';
    const [tokensWithClaimable, setTokensWithClaimable] = useState<any>([]);
    const [isClaiming, setIsClaiming] = useState(false);
    const { switchChainAsync } = useSwitchChain();
    const { chain } = useAccount();
    const [hash, setHash] = useState<`0x${string}`>();
    const [isClaimed, setIsClaimed] = useState(false);
    const [tokensToClaim, setTokensToClaim] = useState<boolean>(false);

    const chainId = useChainId();

    useEffect(() => {
        tokensWithClaimable.filter((token: {
            claimableAmount: string;
        }) => parseFloat(token.claimableAmount) > 0).length > 0 ? setTokensToClaim(true) : setTokensToClaim(false);
    }, [tokensWithClaimable]);

    useEffect(() => {
        const fetchClaimableAmounts = async () => {
            const eligibleTokens = depositedTokens.filter((token: {
                    eligibleForInterest: any;
                    balance: string | number | bigint | boolean;
                }) => {
                    return token.eligibleForInterest || BigInt(token.balance) > BigInt(0);
                }
            );

            const filteredTokens = eligibleTokens.filter((token: { symbol: string; }) => token.symbol.startsWith('YT'));
            const tokensWithAmounts = await Promise.allSettled(filteredTokens.map(async (token: Token) => {
                try {
                    const simulation = await simulateContract(WagmiConfig, {
                        abi: PendleYieldTokenAbi,
                        address: token.tokenAddress,
                        functionName: 'redeemDueInterestAndRewards',
                        chainId:  chainId as ChainId,
                        args: [wallet.walletAddress, true, true],
                    });
                    return {
                        ...token,
                        // @ts-ignore
                        claimableAmount: formatEther(simulation.result[0].toString()) || '0'
                    };
                } catch (e) {
                    console.error(e);
                    return { ...token, claimableAmount: '0' };
                }
            }));

            const successfulTokens = tokensWithAmounts
                .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
                .map((result) => result.value);
            setTokensWithClaimable(successfulTokens);
        };

        fetchClaimableAmounts();
    }, [depositedTokens, wallet]);

    const tokenboundClient = initializeTokenboundClient(chainId);

    const {isLoading, isSuccess} =
        useWaitForTransactionReceipt({
            hash,
            confirmations: NumOfConfirmationsToWaitFor,
        });

    useEffect(() => {
        if (isSuccess) {
            toast.success("All tokens were claimed successfully into your account 🎉");
            setTokensWithClaimable((tokens: Token[]) => tokens.map(token => ({
                ...token,
                claimableAmount: '0'
            })));
            setIsClaimed(true)
        }
    }, [isSuccess]);

    const claimAllYields = async () => {
        setIsClaiming(true);
        try {
            const tokensToClaim = tokensWithClaimable.filter((token: { claimableAmount: string; }) => parseFloat(token.claimableAmount) > 0);
            const tokenAddresses = tokensToClaim.map((token: Token) => token.tokenAddress);
            if (!tokenAddresses.length) {
                return;
            }

            const data = encodeFunctionData({
                abi: ActionMiscV3Abi,
                functionName: 'redeemDueInterestAndRewards',
                args: [wallet.walletAddress, [], tokenAddresses, []],
            });

            (chain?.id !==chainId) && await switchChainAsync({ chainId });

            const hex = await tokenboundClient?.execute({
                account: wallet.walletAddress as unknown as `0x${string}`,
                to: pendleRouterV3Address,
                chainId,
                value: BigInt(0),
                data
            });
            setHash(hex);
        } catch (err) {
            const e = err as WalletClientError;
            console.error('Error claiming all yields:', e);
            toast.error(e.shortMessage);
            setIsClaiming(false)
        } finally {
            setIsClaiming(false);
        }
    };

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <>
            <Button onClick={onOpen} className="michi-transparent-button w-full">Claim</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent className="modal">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex flex-row items-center">
                                    <span className="text-white">Claim Earnings</span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <Table removeWrapper aria-label="Tokenized Points"
                                       className="text-white border-2 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl overflow-hidden">
                                    <TableHeader>
                                        <TableColumn className="bg-transparent px-6 pt-2">Token Symbol</TableColumn>
                                        <TableColumn className="bg-transparent pt-2">Balance</TableColumn>
                                        <TableColumn className="bg-transparent  pt-2">Claimable</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {tokensWithClaimable.map((token: {
                                            symbol: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined;
                                            balance: string | number | bigint | boolean;
                                            claimableAmount: any;
                                        }, key: React.Key | null | undefined) => (
                                            <TableRow key={key} className="border-t-2 border-solid border-custom-gray">
                                                <TableCell className="items-center gap-2 px-6">{token.symbol}</TableCell>
                                                <TableCell className="items-center gap-2">
                                                    {formatBalance(formatEther(BigInt(token.balance)))}
                                                </TableCell>
                                                <TableCell className="items-center gap-2">
                                                    {formatBalance(token.claimableAmount) || "0"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="border-1 border-solid border-custom-gray bg-transparent text-white"
                                        onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button className={`michi-button ${!tokensToClaim ? "grayscale" : ""}`}
                                        onClick={() => claimAllYields()} disabled={isClaiming || !tokensToClaim}>
                                    {(isClaiming || isLoading) && <Spinner color="default"
                                                                           size={"sm"}/>} {tokensToClaim ? "Claim" : "No tokens to claim"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {/*<button onClick={() => dialogRef.current?.showModal()} className={cn('btn btn-outline rounded-lg')}>*/}
            {/*    Claim Yield*/}
            {/*</button>*/}
            {/*<dialog ref={dialogRef} className='modal'>*/}
            {/*    <div className='modal-box bg-[#191E36] flex flex-col items-center gap-8 text-lg px-10 pt-10 max-w-[800px]'>*/}
            {/*        <h2>Claim YT Earnings</h2>*/}
            {/*        <table className='table text-info'>*/}
            {/*            <thead>*/}
            {/*            <tr className='text-[#8C8B94] border-b border-[#2F2F40]'>*/}
            {/*                <th scope="col" className="pr-3 py-3">Token Symbol</th>*/}
            {/*                <th scope="col" className="pr-3 py-3">Balance</th>*/}
            {/*                <th scope="col" className="pr-3 py-3">Claimable</th>*/}
            {/*            </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody>*/}
            {/*            {tokensWithClaimable.map((token: { symbol: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; balance: string | number | bigint | boolean; claimableAmount: any; }, key: React.Key | null | undefined) => (*/}
            {/*                <tr key={key} className="border-t border-[#2F2F40]">*/}
            {/*                    <td className="items-center gap-2">{token.symbol}</td>*/}
            {/*                    <td className="items-center gap-2">{balanceFormatter(formatEther(BigInt(token.balance)))}</td>*/}
            {/*                    <td className="items-center gap-2">{balanceFormatter(token.claimableAmount) || "0"}</td>*/}
            {/*                </tr>*/}
            {/*            ))}*/}
            {/*            </tbody>*/}
            {/*        </table>*/}
            {/*        {*/}
            {/*            tokensWithClaimable.every((token: { claimableAmount: string; }) => parseFloat(token.claimableAmount) === 0) ?*/}
            {/*                <p className="text-white mt-4">No claimable tokens available.</p> :*/}
            {/*                <button*/}
            {/*                    onClick={claimAllYields}*/}
            {/*                    className={`btn btn-gradient text-white rounded-lg mt-4 ${isClaiming ? 'opacity-50 cursor-not-allowed' : ''}`}*/}
            {/*                    disabled={isClaiming}*/}
            {/*                >*/}
            {/*                    {isClaiming ?*/}
            {/*                        <>*/}
            {/*                            <span className="loading loading-spinner" />*/}
            {/*                            <span className="text-white">*/}
            {/*          Claiming*/}
            {/*        </span>*/}
            {/*                        </>*/}
            {/*                        : "Claim All"*/}
            {/*                    }*/}
            {/*                </button>*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*    <form method="dialog" className="modal-backdrop">*/}
            {/*        <button onClick={() => dialogRef.current?.close()} id="close-btn">*/}
            {/*            Close*/}
            {/*        </button>*/}
            {/*    </form>*/}
            {/*</dialog >*/}
        </>
    );
};
export default ClaimInterestFromPendle;
