import React, {useEffect, useMemo} from "react";
import {
    Button,
    ButtonGroup,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    useDisclosure,
} from "@nextui-org/react";
import moment from "moment";
import WalletPointsBreakdown from "../points/walletPointsBreakdown";
import {createOrder, fetchCurrentNonce, OrderData, OrderType} from "../../features/orders/orderAPI";
import {AppDispatch, AppState} from "../../store";
import {useDispatch, useSelector} from "react-redux";
import {ethers} from "ethers";
import {MichiWalletAddress, PichiMarketplaceAddress} from "../../config/michi.config";
import {useAccount, useChainId, useReadContract, useSwitchChain} from "wagmi";
import {
    ArbitrumTokenAddresses,
    EthereumTokenAddresses,
    SepoliaTokenAddresses,
    TokenDecimals
} from "../../config/contracts.config";
import {DateCalculator} from "../common/DateCalculator";
import WalletBalanceTable from "../wallet/walletBalanceTable";
import {ChainId} from "../../types/chain";
import {chainIdToHex, hexToChainId} from "../../utils/formatters";
import {AcceptedPaymentCurrencies, PaymentCurrencyAddress} from "../../types/marketplace";
import {MichiWalletAbi} from "../../abis/michiWallet";
import {toast} from "sonner";
import {EvmAddress} from "../../types/address";
import CancelPreviousListings from "../marketplace/CancelPreviousListings";
import axios from "axios";
import {ApiError} from "../../types/errors";

const durationOptions = [
    {id: 1, duration: {days: 3}, name: "3 Days"},
    {id: 2, duration: {days: 7}, name: "7 Days"},
    {id: 3, duration: {days: 14}, name: "14 Days"},
    {id: 4, duration: {weeks: 4}, name: "4 Weeks"},
    {id: 5, duration: {months: 1}, name: "1 Month"},
    {id: 6, duration: {months: 3}, name: "3 Months"},
    {id: 7, duration: {months: 6}, name: "6 Months"},
    {id: 8, duration: {months: 12}, name: "12 Months"},
];
const Sell = () => {
    const [loading, setLoading] = React.useState(false);
    const orders = useSelector((state: AppState) => state.marketplace.orders);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const {
        isOpen: isCancelOpen,
        onOpen: onCancelOpen,
        onOpenChange: onCancelOpenChange,
        onClose: onCancelClose
    } = useDisclosure();
    const [offerAmount, setOfferAmount] = React.useState<string>('');
    const [duration, setDuration] = React.useState(durationOptions[0]);
    const dispatch = useDispatch<AppDispatch>();
    const [paymentCurrency, setPaymentCurrency] = React.useState<AcceptedPaymentCurrencies>(AcceptedPaymentCurrencies.WETH);
    const {address} = useAccount();
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const {switchChainAsync} = useSwitchChain();
    const chainId = useChainId();
    const [error, setError] = React.useState('');
    const [listed, setListed] = React.useState(false);

    const {data: allowedAddress, refetch: updateNftAllowance} = useReadContract({
        chainId: currentWallet?.chainId,
        address: MichiWalletAddress,
        abi: MichiWalletAbi,
        functionName: "getApproved",
        args: [
            currentWallet?.nftIndex,
        ]
    });

    const {data: approvedForAll, refetch: isApprovedForAll} = useReadContract({
        chainId: currentWallet?.chainId,
        address: MichiWalletAddress,
        abi: MichiWalletAbi,
        functionName: "isApprovedForAll",
        args: [
            address,
            PichiMarketplaceAddress,
        ]
    });

    const approvedToSell = useMemo(
        () => {
            if (allowedAddress && allowedAddress.toString().toLowerCase() === PichiMarketplaceAddress.toLowerCase() || approvedForAll === true) {
                return true;
            } else {
                return false;
            }
        },
        [allowedAddress, approvedForAll]
    );

    useEffect(() => {
        if (currentWallet) {
            updateNftAllowance();
            isApprovedForAll();
            setListed(!(!orders || !orders?.some((order) => order?.tokenId.toString() === currentWallet?.nftIndex)))
        }
    }, [currentWallet]);

    const handleSelectionChange = (selectedId: string) => {
        const selectedDuration = durationOptions.find(
            (option) => option.id === parseInt(selectedId, 10)
        );
        if (selectedDuration) {
            setDuration(selectedDuration);
        }
    };

    const handleOfferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        if (validateOfferAmount(value)) {
            setOfferAmount(value);
            setError('');
        }
    };

    const validateOfferAmount = (value: string) => {
        if (value === '') return true;
        const regex = /^(0(\.\d*)?|[1-9]\d*(\.\d*)?)$/;
        return regex.test(value);
    };

    const approvePichiMarketplace = async () => {
        try {
            let currentChainId = chainId;
            await switchChainAsync({chainId: currentWallet?.chainId || currentChainId});
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(MichiWalletAddress, MichiWalletAbi, signer);
            let tx = await nftContract.approve(PichiMarketplaceAddress, currentWallet?.nftIndex);
            await tx.wait();
            updateNftAllowance();
            await switchChainAsync({chainId: currentChainId});
            setLoading(false);
            toast.success("Approved successfully!");
        } catch (error) {
            setLoading(false);
            toast.error("An error occurred");
            console.error("Error approving marketplace:", error);
        }
    }

    const submitSellOffer = async () => {
        setLoading(true);
        try {
            if (offerAmount === '') {
                setError('Price is required');
                setLoading(false);
            } else if (offerAmount === '0') {
                setError('Price must be greater than 0');
                setLoading(false);
            } else {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const nftIndexString = currentWallet?.nftIndex;
                const nftIndexNumber = Number(nftIndexString);
                let paymentCurrencyAddress: PaymentCurrencyAddress = EthereumTokenAddresses.WETH;

                let chainId = chainIdToHex(ChainId.ETHEREUM);


                if (currentWallet?.chainId === ChainId.ETHEREUM && paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                    if (paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                        paymentCurrencyAddress = EthereumTokenAddresses.USDC;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDT) {
                        paymentCurrencyAddress = EthereumTokenAddresses.USDT;
                    }
                } else if (currentWallet?.chainId === ChainId.ARBITRUM) {
                    chainId = chainIdToHex(ChainId.ARBITRUM);
                    if (paymentCurrency === AcceptedPaymentCurrencies.WETH) {
                        paymentCurrencyAddress = ArbitrumTokenAddresses.WETH;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                        paymentCurrencyAddress = ArbitrumTokenAddresses.USDC;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDT) {
                        paymentCurrencyAddress = ArbitrumTokenAddresses.USDT;
                    }
                } else if (currentWallet?.chainId === ChainId.SEPOLIA) {
                    chainId = chainIdToHex(ChainId.SEPOLIA);
                    if (paymentCurrency === AcceptedPaymentCurrencies.WETH) {
                        paymentCurrencyAddress = SepoliaTokenAddresses.WETH;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                        paymentCurrencyAddress = SepoliaTokenAddresses.USDC;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDT) {
                        paymentCurrencyAddress = SepoliaTokenAddresses.USDT;
                    }
                }

                const decimals = TokenDecimals[paymentCurrencyAddress];
                const adjustedValue = ethers.utils.parseUnits(offerAmount.toString(), decimals);

                if (address && duration?.duration) {
                    const {days = 0, weeks = 0, months = 0} = duration.duration;

                    const expiry = moment()
                        .add(days + weeks * 7 + months * 30, "days")
                        .unix()
                        .toString();

                    const orderData: OrderData = {
                        type: OrderType.Listing,
                        collection: MichiWalletAddress,
                        currency: paymentCurrencyAddress,
                        participant: address.toString() as EvmAddress,
                        chainId: chainId,
                        tokenId: nftIndexNumber,
                        amount: adjustedValue.toString(),
                        expiry: expiry,
                        nonce: 0,
                        signature: "",
                    };

                    orderData.nonce = await fetchCurrentNonce(orderData.chainId, orderData.participant) + 1;

                    const domainSeparator = {
                        name: "PichiMarketplace",
                        version: "1",
                        chainId: hexToChainId(chainId),
                        verifyingContract: PichiMarketplaceAddress,
                    };

                    const types = {
                        Listing: [
                            {name: "seller", type: "address"},
                            {name: "collection", type: "address"},
                            {name: "currency", type: "address"},
                            {name: "tokenId", type: "uint256"},
                            {name: "amount", type: "uint256"},
                            {name: "expiry", type: "uint256"},
                            {name: "nonce", type: "uint256"}
                        ]
                    };

                    const message = {
                        seller: address,
                        collection: MichiWalletAddress,
                        currency: paymentCurrencyAddress,
                        tokenId: nftIndexNumber,
                        amount: ethers.utils.parseUnits(offerAmount.toString(), decimals),
                        expiry: orderData.expiry,
                        nonce: orderData.nonce
                    };

                    orderData.signature = await signer._signTypedData(domainSeparator, types, message);

                    await createOrder(orderData);
                    setListed(true);
                    setLoading(false);
                    toast.success("Listing created successfully!");
                    onClose();
                }
            }
        } catch (error) {
            setLoading(false);
            console.error("Error creating order:", error);

            if (axios.isAxiosError(error)) {
                const apiError = error as ApiError;

                if (apiError.response?.status === 422) {
                    toast.error("Withdraw assets before listing for sale");
                } else if (apiError.response?.status === 424) {
                    onCancelOpen();
                } else if (apiError.response?.data?.message) {
                    toast.error(apiError.response.data.message);
                } else {
                    toast.error("An error occurred");
                }
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="my-6">
            {currentWallet?.chainId != ChainId.MANTLE && <Button onClick={onOpen}
                                                                className="pichi-button-empty">{listed ? "Adjust Price" : "List for Sale"}</Button>}
            <CancelPreviousListings isOpen={isCancelOpen} onOpenChange={onCancelOpenChange} onClose={onCancelClose}
                                    onOpen={onCancelOpen}/>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="5xl"
                onClose={() => setOfferAmount('0')}
            >
                <ModalContent
                    className="border-1 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                <div>Confirm Listing</div>
                            </ModalHeader>
                            <div className="leaderboard-referral-history-row border-b-solid"></div>
                            <ModalBody>
                                <div className="text-white-70 my-2 text-xs">
                                    Note: Listing your Pichi Wallet for sale means that a buyer will gain custody of
                                    all points and assets held by this wallet. Please withdraw all your assets before
                                    proceeding.
                                </div>
                                <div>
                            <span className="text-sm text-white-70 block mb-2">
                                Currency
                            </span>
                                    <ButtonGroup>
                                        <Button
                                            className={`${paymentCurrency === AcceptedPaymentCurrencies.WETH ? "pichi-button-empty" : "rounded-xl"}`}
                                            onClick={() => setPaymentCurrency(AcceptedPaymentCurrencies.WETH)}>WETH</Button>
                                        <Button
                                            className={`${paymentCurrency === AcceptedPaymentCurrencies.USDC ? "pichi-button-empty" : "rounded-xl"}`}
                                            onClick={() => setPaymentCurrency(AcceptedPaymentCurrencies.USDC)}>USDC</Button>
                                        <Button
                                            className={`${paymentCurrency === AcceptedPaymentCurrencies.USDT ? "pichi-button-empty" : "rounded-xl"}`}
                                            onClick={() => setPaymentCurrency(AcceptedPaymentCurrencies.USDT)}>USDT</Button>
                                    </ButtonGroup>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            type="text"
                                            label="Price"
                                            placeholder="0.00"
                                            onChange={handleOfferAmountChange}
                                            value={offerAmount?.toString()}
                                            className="input"
                                            min={0}
                                            step="any"
                                        />
                                        {error && <p className="text-sm text-red-500">{error}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Select
                                            label="Offer Expires"
                                            variant="bordered"
                                            items={durationOptions}
                                            defaultSelectedKeys={[duration.id.toString()]}
                                            onChange={(e) => handleSelectionChange(e.target.value)}
                                        >
                                            {(durationOption) => <SelectItem
                                                key={durationOption.id}>{durationOption.name}</SelectItem>}
                                        </Select>
                                    </div>
                                </div>
                                <div className="text-tiny mb-4">
                                    Offer Expires: <span className="text-white-80"><DateCalculator
                                    duration={duration.duration}/></span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <span className="text-md text-white block mb-2">Assets Currently Deposited in this Wallet</span>
                                        <WalletBalanceTable walletSale={true}/>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="text-md text-white block mb-2">Points</span>
                                        <WalletPointsBreakdown showScrollbar={true}/>
                                    </div>
                                </div>
                                <div className="text-white-70 mb-4 font-bold text-xs">
                                    Note: You may permanently lose custody of these assets when you list this Pichi
                                    Wallet for sale. Please withdraw these assets before listing this wallet for sale.
                                    Pichi is not responsible for any loss of assets.
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                {approvedToSell ? (
                                    <Button className="pichi-button" disabled={loading} onClick={submitSellOffer}>
                                        {loading && <Spinner color="default" size={"sm"}/>} List for Sale
                                    </Button>
                                ) : (
                                    <Button className="pichi-button" disabled={loading}
                                            onClick={approvePichiMarketplace}>
                                        {loading && <Spinner color="default" size={"sm"}/>} Approve Selling
                                    </Button>
                                )}
                                <Button className="pichi-button-empty" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>

    );
};

export default Sell;
