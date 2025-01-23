import React, {useEffect} from "react";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import {Wallet} from "../../types/wallet";
import {Token} from "../../types/token";
import {getActualBalance} from "../../utils/helpers";
import {encodeFunctionData} from "viem";
import {useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt} from "wagmi";
import {DefaultTokenABI} from "../../abis/tokens";
import {ethers} from "ethers";
import {toast} from "sonner";
import {formatAddress} from "../../utils/formatters";
import {getCurrentWalletTokens, getTokenBalance} from "../../features/wallet/walletSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {NumOfConfirmationsToWaitFor} from "../../config/wagmi.config";
import {Address} from "@ethereumjs/util";
import {initializeTokenboundClient} from "../../hooks/useTokenboundClient";
import {WalletClientError} from "../../types/errors";
import {getTokenDecimals} from "../../utils/getTokenDecimals";

type Props = {
    wallet: Wallet
    className?: string
}
export const Withdraw: React.FC<Props> = ({wallet, className}) => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [currentToken, setCurrentToken] = React.useState<Token>();
    const [input, setInput] = React.useState<String>();
    const chainId = useChainId();
    const {address} = useAccount();
    const dispatch = useDispatch();
    const {switchChainAsync} = useSwitchChain();

    const [loading, setLoading] = React.useState(false);
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const [txHash, setTxHash] = React.useState<`0x${string}`>();

    const tokenboundClient = initializeTokenboundClient(wallet.chainId);

    const {isLoading: isConfirming, isSuccess: isConfirmed, data: transactionReceipt} =
        useWaitForTransactionReceipt({
            hash: txHash,
            confirmations: NumOfConfirmationsToWaitFor,
        });

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Withdrawal Successful");
            dispatch(getTokenBalance({chainId, walletAddress: address as unknown as Address}));
            dispatch(getCurrentWalletTokens({chainId, walletAddress: wallet.walletAddress}));
            onClose();
        }
    }, [isConfirmed]);

    const withdraw = async () => {
        setLoading(true);
        try {
            await switchChainAsync({chainId: wallet.chainId});
            const data = encodeFunctionData({
                abi: DefaultTokenABI,
                functionName: 'transfer',
                args: [address,
                    ethers.utils.parseUnits((String(input)), currentToken?.decimals)],
            });
            if (currentToken && tokenboundClient) {
                const txHash = await tokenboundClient.execute({
                    account: (wallet.walletAddress as unknown) as `0x${string}`,
                    to: currentToken?.tokenAddress,
                    chainId: chainId,
                    value: BigInt(0),
                    data
                });
                setTxHash(txHash);
                await switchChainAsync({chainId});

            }
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        }
        setLoading(false);
        // setWithdrawalHash(res);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(value as unknown as number)) {
            setInput(value);
        }
    };

    useEffect(() => {
        const fetchTokenDecimals = async () => {
            if (currentToken?.decimals === undefined && currentToken?.tokenAddress) {
                let provider = new ethers.providers.Web3Provider(window.ethereum);
                let decimals = await getTokenDecimals(provider, currentToken?.tokenAddress);
                setCurrentToken({...currentToken, decimals: decimals});
            }
        }
        fetchTokenDecimals();
    }, [currentToken]);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const token = currentWallet?.tokens?.find(token => token.symbol === e.target.value);
        setCurrentToken(token);
    };

    return (
        <>
            <Button onClick={onOpen}
                    className={`w-1/2 bg-transparent border-1 border-solid border-custom-gray ${className} rounded-md`}>
                Withdraw
            </Button>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                    <ModalContent
                        className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-custom-gradient p-4">
                        <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                            Withdrawing from {formatAddress(wallet.walletAddress)} owned by Pichi NFT #{wallet.nftIndex}
                        </ModalHeader>
                        <ModalBody>
                            {currentWallet?.tokens && (
                                <Select
                                    items={currentWallet?.tokens}
                                    label="Select Token"
                                    placeholder="Select a token"
                                    className="select"
                                    onChange={onChange}
                                >
                                    {(token) => (
                                        <SelectItem key={token.symbol} endContent={getActualBalance(token) || ""}>
                                            {token.symbol}
                                        </SelectItem>
                                    )}
                                </Select>
                            )}
                            {currentToken && (
                                <div className="flex">
                                    <Input
                                        className="input"
                                        label="Price"
                                        placeholder="0.00"
                                        onChange={handleChange}
                                        max={getActualBalance(currentToken)}
                                        value={input?.toString()}
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
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {currentToken && (
                                <Button className="pichi-button w-full" onPress={withdraw} disabled={loading}>
                                    {(loading || isConfirming) && <Spinner color="default" size={"sm"}/>} Withdraw
                                </Button>
                            )}
                        </ModalFooter>
                    </ModalContent>
                </Modal>
        </>
    );
}