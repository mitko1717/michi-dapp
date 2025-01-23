import React, {useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spacer,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import {Wallet} from "../../types/wallet";
import {MaxUint256, Token} from "../../types/token";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {getActualBalance} from "../../utils/helpers";
import {useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {DefaultTokenABI} from "../../abis/tokens";
import {MichiHelperAddress} from "../../config/michi.config";
import {MichiHelperAbi} from "../../abis/pichi";
import {toast} from "sonner";
import {formatAddress, formatBalance} from "../../utils/formatters";
import {getCurrentWalletTokens, getTokenBalance} from "../../features/wallet/walletSlice";
import {NumOfConfirmationsToWaitFor} from "../../config/wagmi.config";
import {Address} from "@ethereumjs/util";
import BonusTags from "./BonusTags";
import Categories from "./Categories";
import {getCategoriesFromChain} from "../../utils/categories";
import {WalletClientError} from "../../types/errors";
import {ethers} from "ethers";
import {getTokenDecimals} from "../../utils/getTokenDecimals";
import {track} from "@vercel/analytics";
import {SwitchChain} from "./SwitchChain";
import {ChainNameMap} from "../../config/contracts.config";

type Props = {
    wallet: Wallet,
}
export const Deposit: React.FC<Props> = ({wallet}) => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const approvedTokens = useSelector((state: AppState) => state.tokens.approvedTokens);
    const tokenBalance = useSelector((state: AppState) => state.wallet.tokenBalance);
    const {address} = useAccount();
    const chainId = useChainId();
    const [loading, setLoading] = React.useState(false);
    const [approvalLoading, setApprovalLoading] = React.useState(false);
    const dispatch = useDispatch();
    const [approveMax, setApproveMax] = useState(false);
    const [depositableTokens, setDepositableTokens] = React.useState<Token[]>([]);
    const [filteredTokens, setFilteredTokens] = React.useState<Token[]>([]);
    const [currentToken, setCurrentToken] = React.useState<Token>();
    const [input, setInput] = React.useState<String>();

    const {writeContractAsync: depositTokensAsync, data: txHash} = useWriteContract();

    const {isLoading: isConfirming, isSuccess: isConfirmed, data: transactionReceipt} =
        useWaitForTransactionReceipt({
            hash: txHash,
            confirmations: NumOfConfirmationsToWaitFor,
        });

    useEffect(() => {
        // @ts-ignore
        const mergedTokens: Token[] = approvedTokens.map((token) => {
            const balanceToken = tokenBalance.find(_token => _token.tokenAddress === token.address);
            const balance = balanceToken ? balanceToken.balance : 0;
            if (!token.name) {
                return null;
            }
            return {
                chainId: token.chain_id,
                tokenAddress: token.address,
                name: token.name,
                symbol: token.symbol,
                balance,
                decimals: token.decimals
            };
        }).filter(token => token !== null); // Filter out any null values

        function getComparableBalance(token: Token): number {
            if (token.balance === undefined) return 0;
            const balance = typeof token.balance === "string" ? parseFloat(token.balance) : token.balance;
            return balance / Math.pow(10, token.decimals);
        }

        const sortedTokens = mergedTokens.sort((a, b) => {
            const balanceA = getComparableBalance(a);
            const balanceB = getComparableBalance(b);
            return balanceB - balanceA;
        });

        setDepositableTokens(sortedTokens);
        setFilteredTokens(sortedTokens);
    }, [approvedTokens, tokenBalance]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Deposit successful");
            dispatch(getTokenBalance({chainId, walletAddress: address as unknown as Address}));
            dispatch(getCurrentWalletTokens({chainId, walletAddress: wallet.walletAddress}));
            onClose();
        }
    }, [isConfirmed]);


    const depositToken = async () => {
        setLoading(true);
        try {
            if (currentToken) {
                await depositTokensAsync({
                    account: address,
                    abi: MichiHelperAbi,
                    chainId,
                    address: MichiHelperAddress,
                    functionName: "depositToken",
                    args: [
                        currentToken?.tokenAddress,
                        wallet.walletAddress,
                        ethers.utils.parseUnits((String(input)), currentToken?.decimals),
                        false
                    ],
                });
                track("Deposit Transaction Initiated");
            }
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
        }
        setLoading(false);
    };


    const {data: currentTokenAllowance, refetch: refetchCurrentTokenAllowance} = useReadContract({
        chainId,
        address: currentToken?.tokenAddress,
        abi: DefaultTokenABI,
        functionName: "allowance",
        args: [
            address,
            MichiHelperAddress
        ]
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(value as unknown as number)) {
            setInput(value);
        }
    };

    const {
        writeContractAsync: writeApprovalContractAsync,
        isPending: isApprovalPending,
        isSuccess: isApprovalSuccess,
        data: hashApproval
    } = useWriteContract();

    const approve = async (type?: string) => {
        setApprovalLoading(true);
        setApproveMax(type === "max");
        try {
            await writeApprovalContractAsync({
                account: address,
                abi: DefaultTokenABI,
                chainId,
                address: currentToken?.tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [
                    MichiHelperAddress,
                    type === "max" ? MaxUint256 : ethers.utils.parseUnits((String(input || "0")), currentToken?.decimals),
                ],
            });
            track("Deposit Approve Initiated");
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        }
        setApprovalLoading(false);
        setApproveMax(false);
    };

    const {isLoading: isConfirmingApproval, isSuccess: isConfirmedApproval, data: transactionReceiptApproval} =
        useWaitForTransactionReceipt({
            hash: hashApproval,
            confirmations: NumOfConfirmationsToWaitFor,
        });

    useEffect(() => {
        if (currentToken || isApprovalSuccess) {
            refetchCurrentTokenAllowance();
        }
        const fetchTokenDecimals = async () => {
            if (currentToken?.decimals === undefined && currentToken?.tokenAddress) {
                let provider = new ethers.providers.Web3Provider(window.ethereum);
                let decimals = await getTokenDecimals(provider, currentToken?.tokenAddress);
                setCurrentToken({...currentToken, decimals: decimals});
            }
        };
        fetchTokenDecimals();
    }, [currentToken, isApprovalSuccess]);

    useEffect(() => {
        refetchCurrentTokenAllowance();
        depositToken();
    }, [isConfirmedApproval]);

    const approvedToDeposit = useMemo(
        () => {
            if (currentTokenAllowance && typeof currentTokenAllowance === "bigint") {
                return Number(ethers.utils.formatUnits(currentTokenAllowance, currentToken?.decimals)) >= Number(input);
            }
            return false;
        },
        [input, currentTokenAllowance,]
    );

    const [selected, setSelected] = React.useState(["all"]);

    const filterTokens = () => {
        if (selected.includes("all")) {
            return depositableTokens;
        }
        return depositableTokens.filter(token => {
            return getCategoriesFromChain(chainId).some(category => {
                if (selected.includes(category.name)) {
                    return category.symbols.some(symbol => {
                        if (category.name !== "Pendle LPT" && token.symbol.toLowerCase().startsWith(symbol.toLowerCase()) && !token.symbol.toLowerCase().includes("lpt")) {
                            return true;
                        } else if (category.name === "Pendle LPT" && token.symbol.toLowerCase().includes(symbol.toLowerCase())) {
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            });
        });
    };

    useEffect(() => {
        const _tokens = filterTokens();
        setFilteredTokens(_tokens);
    }, [selected]);

    const onChange = (e: any) => {
        const token = depositableTokens.find(token => token.name === e);
        track("Token Selected", {token: e});
        setCurrentToken(token);
        setInput("0");
    };

    const openModal = () => {
        track("Deposit Opened");
        onOpen();
    };

    return (
        <>
            <Button onClick={() => openModal()} className="pichi-button">Deposit</Button>
            {wallet.chainId === chainId ? (
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl"
                       onClose={() => setCurrentToken(undefined)}>
                    <ModalContent
                        className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-custom-gradient p-4">
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                    Depositing to {formatAddress(wallet.walletAddress)} owned by Pichi NFT
                                    #{wallet.nftIndex}
                                </ModalHeader>
                                <ModalBody>
                                    <Categories setSelected={setSelected} selected={selected}/>
                                    <Spacer y={1}/>
                                    <Autocomplete
                                        defaultItems={filteredTokens}
                                        variant="bordered"
                                        label="Select Token"
                                        placeholder="Select a token"
                                        onSelectionChange={onChange}
                                        listboxProps={{
                                            hideSelectedIcon: true,
                                            itemClasses: {
                                                base: [
                                                    "p-0",
                                                    "rounded-medium",
                                                    "transition-opacity",
                                                    "data-[hover=true]:text-foreground",
                                                    "dark:data-[hover=true]:bg-default-50",
                                                    "data-[pressed=true]:opacity-70",
                                                    "data-[hover=true]:bg-default-200",
                                                    "data-[selectable=true]:focus:bg-default-100",
                                                    "data-[focus-visible=true]:ring-default-500",
                                                ],
                                            },
                                        }}
                                    >
                                        {(_token) => (
                                            <AutocompleteItem key={_token.name} textValue={_token.symbol}>
                                                <div
                                                    className="flex justify-between p-4 border-b border-custom-border-gray">
                                                    <div>
                                                        <span>{_token.symbol}</span>
                                                        <BonusTags chainId={chainId} token={_token}/>
                                                    </div>
                                                    {_token.balance ? formatBalance(getActualBalance(_token)) : ""}
                                                </div>
                                            </AutocompleteItem>
                                        )}
                                    </Autocomplete>

                                    {/*<Select*/}
                                    {/*    items={data}*/}
                                    {/*    label="Select Token"*/}
                                    {/*    placeholder="Select a token"*/}
                                    {/*    className="select"*/}
                                    {/*    onChange={onChange}*/}
                                    {/*>*/}
                                    {/*    {(token) => <SelectItem key={token.symbol}*/}
                                    {/*                            endContent={getActualBalance(token) || ""}>*/}
                                    {/*        {token.symbol}*/}
                                    {/*    </SelectItem>}*/}
                                    {/*</Select>*/}
                                    {currentToken && <div className="flex">
                                        <Input
                                            label="Amount to deposit"
                                            placeholder="0.00"
                                            onChange={handleChange}
                                            max={getActualBalance(currentToken)}
                                            value={input?.toString()}
                                            className="input"
                                            min={0}
                                        />
                                        <div className="ml-2">
                                            <Button
                                                className="styled-button h-full"
                                                onClick={() => setInput(ethers.utils.formatUnits(BigInt(currentToken?.balance), currentToken?.decimals))}
                                            >
                                                Max
                                            </Button>
                                        </div>
                                    </div>
                                    }
                                    {
                                        currentToken &&
                                        <p className="text-white">Available: {getActualBalance(currentToken)}</p>
                                    }
                                </ModalBody>
                                <ModalFooter>
                                    {currentToken && Number(currentToken?.balance) > 0 && (approvedToDeposit ?
                                        <Button className="pichi-button w-full"
                                                onClick={() => depositToken()} disabled={loading}>
                                            {(loading || isConfirming) &&
                                                <Spinner color="default" size={"sm"}/>} Deposit
                                        </Button> :
                                        <>
                                            <Button
                                                className={`pichi-button ${(approvalLoading || isConfirming) && approveMax ? "grayscale" : ""}`}
                                                onClick={() => approve()} disabled={approvalLoading}>
                                                {(approvalLoading || isConfirming) && !approveMax &&
                                                    <Spinner color="default" size={"sm"}/>} Approve
                                            </Button>
                                            <Button
                                                className={`pichi-button ${(approvalLoading || isConfirming) && !approveMax ? "grayscale" : ""} `}
                                                onClick={() => approve("max")} disabled={approvalLoading}>
                                                {(approvalLoading || isConfirming) && approveMax &&
                                                    <Spinner color="default" size={"sm"}/>} Approve Max
                                            </Button>
                                        </>)
                                    }
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            ) : (
                <SwitchChain
                    title={"Please switch chain to deposit"}
                    description={`In order for you to deposit you need to be connected to ${ChainNameMap[wallet.chainId]}`}
                    wallet={wallet}
                    isOpen={isOpen}
                    onClose={onClose}
                />
            )}
        </>
    );
};