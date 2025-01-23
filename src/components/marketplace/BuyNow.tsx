import React, {useEffect} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Switch,
    useDisclosure,
} from "@nextui-org/react";
import WalletPointsBreakdown from "../points/walletPointsBreakdown";
import {AppState} from "../../store";
import {useSelector} from "react-redux";
import {ethers} from "ethers";
import {useAccount} from "wagmi";
import {PichiMarketAbi} from "../../abis/pichi";
import {PichiMarketplaceAddress} from "../../config/michi.config";
import {toast} from "sonner";
import WalletPrice from "../misc/WalletPrice";
import {DefaultTokenABI} from "../../abis/tokens";
import {BigNumber} from "@ethersproject/bignumber";
import {MaxUint256} from "../../types/token";
import {ArbitrumTokenAddresses, EthereumTokenAddresses, SepoliaTokenAddresses} from "../../config/contracts.config";

const BuyNow = () => {
    const [loading, setLoading] = React.useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const currentOrder = useSelector((state: AppState) => state.marketplace.currentOrder);
    const [totalPoints, setTotalPoints] = React.useState("");
    const [sufficientAllowance, setSufficientAllowance] = React.useState(false);
    const [allowance, setAllowance] = React.useState(BigNumber.from(0));
    const {address} = useAccount();
    const [maxAllowanceLoading, setMaxAllowanceLoading] = React.useState(false);
    const [allowanceLoading, setAllowanceLoading] = React.useState(false);
    const [payWithEth, setPayWithEth] = React.useState(true);
    const [isCurrencyEth, setIsCurrencyEth] = React.useState(false);

    useEffect(() => {
        if (currentWallet?.points) {
            const _totalPoints = currentWallet.points.reduce((acc, point) => acc + Number(point.points), 0);
            setTotalPoints(_totalPoints.toFixed(2));
        }
    }, [currentWallet]);

    const getAllowance = async () => {
        let currentAllowance = 0;
        if (currentOrder) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const currencyContract = new ethers.Contract(currentOrder.currency, DefaultTokenABI, signer);
            currentAllowance = await currencyContract.allowance(address, PichiMarketplaceAddress);
            setAllowance(BigNumber.from(currentAllowance));
        } else {
            setAllowance(BigNumber.from(0));
        }
    }
    const checkCurrency = (currencyAddress: string) => {
        const listOfWeths = [EthereumTokenAddresses.WETH.toLowerCase(), ArbitrumTokenAddresses.WETH.toLowerCase(), SepoliaTokenAddresses.WETH.toLowerCase()];
        if (listOfWeths.includes(currencyAddress.toLowerCase())) {
            setIsCurrencyEth(true);
        }
    }

    useEffect(() => {
        const checkAllowance = async () => {
            if (currentOrder?.currency) {
                await getAllowance();
                checkCurrency(currentOrder.currency);
            }
        }
        checkAllowance();
        if (allowance != undefined != undefined && currentOrder) {
            if (BigNumber.from(allowance).gt(currentOrder?.amount) || BigNumber.from(allowance).eq(currentOrder?.amount)) {
                setSufficientAllowance(true);
            } else {
                setSufficientAllowance(false);
            }
        }
    }, [currentOrder, currentWallet]);

    const buy = async () => {

        setLoading(true);
        if (currentOrder) {
            const sig = ethers.utils.splitSignature(currentOrder.signature);
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const contract = new ethers.Contract(PichiMarketplaceAddress, PichiMarketAbi, signer);
                const currencyContract = new ethers.Contract(currentOrder.currency, DefaultTokenABI, signer);
                let balance = await currencyContract.balanceOf(address);
                const date = new Date(currentOrder.expiry);
                const unixTimestamp = Math.floor(date.getTime() / 1000);
                const paymentAmount = currentOrder?.amount
                if (payWithEth && isCurrencyEth) {
                    balance = await provider.getBalance(signer.getAddress());
                }
                if (BigNumber.from(paymentAmount).gt(balance) && !payWithEth || BigNumber.from(paymentAmount).gt(balance) && payWithEth) {
                    toast.error("Insufficient balance");
                } else {
                    const order = [
                        [
                            currentOrder.collection,
                            currentOrder.currency,
                            currentOrder.tokenId,
                            paymentAmount,
                            String(unixTimestamp)
                        ],
                        currentOrder?.wallet?.owner_address,
                        sig.v,
                        sig.r,
                        sig.s,
                        currentOrder.nonce
                    ];

                    const tx = await contract.executeListing(order, {value: payWithEth && isCurrencyEth ? paymentAmount : 0});
                    await tx.wait();
                    toast.success("Order executed successfully!");
                    onClose();
                }
            } catch (e: any) {
                console.error(e);
                toast.error(e.shortMessage || "An error occurred");
            } finally {
                setLoading(false);
            }
        }
    };
    const setLoadingState = (approveMax: boolean, isLoading: boolean) => {
        if (approveMax) {
            setMaxAllowanceLoading(isLoading);
        } else {
            setAllowanceLoading(isLoading);
        }
    };

    const approveTokens = async (approveMax: boolean) => {
        if (!currentOrder) return;

        setLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const currencyContract = new ethers.Contract(currentOrder.currency, DefaultTokenABI, signer);
            const approvalAmount = approveMax
                ? MaxUint256
                : ethers.utils.parseUnits(currentOrder.amount.toString(), await currencyContract.decimals());
            setLoadingState(approveMax, true);
            const approveTx = await currencyContract.approve(PichiMarketplaceAddress, approvalAmount);
            await approveTx.wait();
            toast.success(`${approveMax ? "Max " : ""}Approval successful!`);
            await getAllowance();
            setSufficientAllowance(true);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "An error occurred during approval");
        } finally {
            setLoading(false);
            setLoadingState(approveMax, false);
        }
    };


    return (
        <>
            <Button onClick={onOpen} className="pichi-button min-w-[150px]">Buy Now</Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="xl"
            >
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient ">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium py-6">
                                <div>Confirm Purchase</div>
                            </ModalHeader>
                            <div className="leaderboard-referral-history-row border-b-solid"></div>
                            <ModalBody>
                                <div>
                                    <h2 className="text-medium text-subtitle">Pichi Wallet
                                        #{currentWallet?.nftIndex}</h2>
                                    {currentOrder && <WalletPrice order={currentOrder}/>}
                                </div>
                                {isCurrencyEth &&
                                    <div className="flex items-center">
                                        Buy with ETH <img src={`/assets/logos/eth.png`} alt="Logo"
                                                          className="h-5 ml-1"/>
                                        <Switch className="ml-1" aria-label="Eth" size="sm" isSelected={!payWithEth}
                                                onValueChange={(e) => setPayWithEth(!e)}/>
                                        WETH <img src={`/assets/logos/weth.png`} alt="Logo" className="h-5 ml-1"/>
                                    </div>}
                                <div className="leaderboard-referral-history-row border-b-solid"></div>
                                <h2 className="text-medium text-subtitle">Points</h2>
                                <WalletPointsBreakdown showScrollbar={true}/>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                <div className="w-full">
                                    {!sufficientAllowance && (!payWithEth || !isCurrencyEth) ? (
                                        <div className="w-full flex items-center justify-center">
                                            <Button className="pichi-button w-1/2" disabled={loading} onClick={() => {
                                                approveTokens(false);
                                            }}>
                                                {allowanceLoading && <Spinner color="default" size={"sm"}/>} Approve
                                            </Button>
                                            <Button className="pichi-button w-1/2" disabled={loading} onClick={() => {
                                                approveTokens(true);
                                            }}>
                                                {maxAllowanceLoading && <Spinner color="default" size={"sm"}/>} Approve
                                                Max
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button className="pichi-button w-full" onClick={() => buy()}>
                                            {loading && <Spinner color="default" size={"sm"}/>} Buy Now
                                        </Button>
                                    )}
                                </div>
                                <Button className="pichi-button-empty" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default BuyNow;
