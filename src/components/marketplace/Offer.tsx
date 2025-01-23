import React, {useEffect} from "react";
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
import {DateCalculator} from "../common/DateCalculator";
import {ethers} from "ethers";
import {
    ArbitrumTokenAddresses,
    EthereumTokenAddresses,
    SepoliaTokenAddresses,
    TokenAddressesMap,
    TokenDecimals,
    TokenSymbols
} from "../../config/contracts.config";
import {fetchCurrentNonce, OrderData, OrderType} from "../../features/orders/orderAPI";
import {MichiWalletAddress, PichiMarketplaceAddress} from "../../config/michi.config";
import {createNewOrder} from "../../features/orders/orderSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "../../store";
import {chainIdToHex, hexToChainId} from "../../utils/formatters";
import {ChainId} from "../../types/chain";
import {useAccount, useChainId} from "wagmi";
import {AcceptedPaymentCurrencies, PaymentCurrencyAddress} from "../../types/marketplace";
import {EvmAddress} from "../../types/address";
import {DefaultTokenABI} from "../../abis/tokens";
import {BigNumber} from "@ethersproject/bignumber";
import {MaxUint256} from "../../types/token";
import {toast} from "sonner";
import WalletPointsBreakdown from "../points/walletPointsBreakdown";
import {useNFTDataAndOffers} from "../../hooks/currentWalletMarketplace";


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

const Offer = () => {
    const [loading, setLoading] = React.useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [offerAmount, setOfferAmount] = React.useState<string>('0');
    const [duration, setDuration] = React.useState(durationOptions[0]);
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const [paymentCurrency, setPaymentCurrency] = React.useState<string>("WETH");
    const {address} = useAccount();
    const dispatch = useDispatch<AppDispatch>();
    const [offerPoints, setOfferPoints] = React.useState("");
    const currentOrder = useSelector((state: AppState) => state.marketplace.currentOrder);
    const [wethAllowance, setWethAllowance] = React.useState(BigNumber.from(0));
    const [usdcAllowance, setUsdcAllowance] = React.useState(BigNumber.from(0));
    const chainId = useChainId();
    const [wethAddress, setWethAddress] = React.useState<string>("");
    const [usdcAddress, setUsdcAddress] = React.useState<string>("");
    const [sufficientAllowance, setSufficientAllowance] = React.useState(false);
    const {fetchOffers} = useNFTDataAndOffers(currentOrder?.wallet?.wallet_address, chainId);
    const [wethBalance, setWethBalance] = React.useState(BigNumber.from(0));
    const [usdcBalance, setUsdcBalance] = React.useState(BigNumber.from(0));
    const [maxAllowanceLoading, setMaxAllowanceLoading] = React.useState(false);
    const [allowanceLoading, setAllowanceLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const setLoadingState = (approveMax: boolean, isLoading: boolean) => {
        if (approveMax) {
            setMaxAllowanceLoading(isLoading);
        } else {
            setAllowanceLoading(isLoading);
        }
    };

    const getTokenAllowance = async (currencyAddress: string, tokenName: string) => {
        let currentAllowance = 0;
        if (currentOrder && currencyAddress) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const currencyContract = new ethers.Contract(currencyAddress, DefaultTokenABI, signer);
            currentAllowance = await currencyContract.allowance(address, PichiMarketplaceAddress);
            if (tokenName === "WETH") {
                setWethAllowance(BigNumber.from(currentAllowance));
            } else {
                setUsdcAllowance(BigNumber.from(currentAllowance));
            }
        } else {
            if (tokenName === "WETH") {
                setWethAllowance(BigNumber.from(0));
            } else {
                setUsdcAllowance(BigNumber.from(0));
            }
        }
    }
    const getCoinAddresses = () => {
        const addresses = TokenAddressesMap[chainId];
        if (addresses) {
            setUsdcAddress(addresses.USDC);
            setWethAddress(addresses.WETH);
        } else {
            console.error('Unsupported chain ID');
        }
    };

    const getCoinBalance = async (currencyAddress: string, tokenName: string) => {
        if (currentOrder && currencyAddress) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const currencyContract = new ethers.Contract(currencyAddress, DefaultTokenABI, signer);
            const balance = await currencyContract.balanceOf(address);
            if (tokenName === "WETH") {
                setWethBalance(BigNumber.from(balance));
            } else {
                setUsdcBalance(BigNumber.from(balance));
            }
            return balance;
        }
    }
    useEffect(() => {
        getCoinAddresses();

        const checkAllowance = async () => {
            if (currentOrder?.currency) {
                await getTokenAllowance(wethAddress, TokenSymbols[wethAddress]);
                await getTokenAllowance(usdcAddress, TokenSymbols[usdcAddress]);
                await getCoinBalance(wethAddress, TokenSymbols[wethAddress]);
                await getCoinBalance(usdcAddress, TokenSymbols[usdcAddress]);
            }
        }
        checkAllowance();
    }, [currentOrder, currentWallet]);

    useEffect(() => {
        if (offerAmount) {
            if (paymentCurrency === "WETH") {
                const offerAmountBN = BigNumber.from(ethers.utils.parseUnits(offerAmount, 18));
                if (wethAllowance.gte(offerAmountBN) || wethAllowance.eq(offerAmountBN)) {
                    setSufficientAllowance(true);
                    if (wethBalance.lt(offerAmountBN)) {
                        setError('Insufficient balance');
                    } else {
                        setError('');
                    }
                } else {
                    setSufficientAllowance(false);
                }
            } else if (paymentCurrency === "USDC") {
                const offerAmountBN = BigNumber.from(ethers.utils.parseUnits(offerAmount, TokenDecimals[usdcAddress]));
                if (usdcAllowance.gte(offerAmountBN) || usdcAllowance.eq(offerAmountBN)) {
                    setSufficientAllowance(true);
                    if (usdcBalance.lt(offerAmountBN)) {
                        setError('Insufficient balance');
                    } else {
                        setError('');
                    }
                } else {
                    setSufficientAllowance(false);
                }
            }
        }
    }, [wethAllowance, usdcAllowance, offerAmount, paymentCurrency]);

    useEffect(() => {
        if (currentWallet?.points) {
            const currentOfferPoints = currentWallet.points.reduce((acc, point) => acc + Number(point.points), 0);
            setOfferPoints(currentOfferPoints.toFixed(2));
        }
    }, [currentWallet]);
    // Array of duration options


    const handleSelectionChange = (selectedId: string) => {
        const selectedDuration = durationOptions.find(
            (option) => option.id === parseInt(selectedId, 10)
        );
        if (selectedDuration) {
            setDuration(selectedDuration);
        }
    };

    const submitOffer = async () => {
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
                    paymentCurrencyAddress = EthereumTokenAddresses.USDC;
                } else if (currentWallet?.chainId === ChainId.ARBITRUM) {
                    chainId = chainIdToHex(ChainId.ARBITRUM);
                    if (paymentCurrency === AcceptedPaymentCurrencies.WETH) {
                        paymentCurrencyAddress = ArbitrumTokenAddresses.WETH;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                        paymentCurrencyAddress = ArbitrumTokenAddresses.USDC;
                    }
                } else if (currentWallet?.chainId === ChainId.SEPOLIA) {
                    chainId = chainIdToHex(ChainId.SEPOLIA);
                    if (paymentCurrency === AcceptedPaymentCurrencies.WETH) {
                        paymentCurrencyAddress = SepoliaTokenAddresses.WETH;
                    } else if (paymentCurrency === AcceptedPaymentCurrencies.USDC) {
                        paymentCurrencyAddress = SepoliaTokenAddresses.USDC;
                    }
                }

                const decimals = TokenDecimals[paymentCurrencyAddress];
                const adjustedValue = ethers.utils.parseUnits(offerAmount.toString(), decimals);

                if (address) {
                    const {days = 0, weeks = 0, months = 0} = duration?.duration || {};

                    const expiry = moment()
                        .add(days + weeks * 7 + months * 30, "days")
                        .unix()
                        .toString();

                    const orderData: OrderData = {
                        type: OrderType.Bid,
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
                        Offer: [
                            {name: "buyer", type: "address"},
                            {name: "collection", type: "address"},
                            {name: "currency", type: "address"},
                            {name: "tokenId", type: "uint256"},
                            {name: "amount", type: "uint256"},
                            {name: "expiry", type: "uint256"},
                            {name: "nonce", type: "uint256"}
                        ]
                    };

                    const message = {
                        buyer: address,
                        collection: MichiWalletAddress,
                        currency: paymentCurrencyAddress,
                        tokenId: nftIndexNumber,
                        amount: ethers.utils.parseUnits(offerAmount.toString(), decimals),
                        expiry: orderData.expiry,
                        nonce: orderData.nonce
                    };

                    orderData.signature = await signer._signTypedData(domainSeparator, types, message);
                    await dispatch(createNewOrder(orderData));
                    toast.success("Offer sent successfully!!");
                    fetchOffers(nftIndexNumber);
                    onClose();
                }
            }
        } catch (e) {
            const error = e as Error;
            console.error("Error creating order:", error);
            toast.error(error?.message || "An error occurred while creating the order");
        }
        setLoading(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let {value} = e.target;

        if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
            value = value[1];
        }
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
    const approveTokens = async (approveMax: boolean) => {
        if (!currentOrder) return;

        setLoading(true);
        try {
            let currencyAddress = "";
            if (paymentCurrency === "WETH") {
                currencyAddress = wethAddress;
            } else {
                currencyAddress = usdcAddress;
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const currencyContract = new ethers.Contract(currencyAddress, DefaultTokenABI, signer);

            const approvalAmount = approveMax
                ? MaxUint256
                : ethers.utils.parseUnits(offerAmount.toString(), TokenDecimals[currencyAddress]);
            setLoadingState(approveMax, true);

            const approveTx = await currencyContract.approve(PichiMarketplaceAddress, approvalAmount);
            await approveTx.wait();

            toast.success(`${approveMax ? "Max " : ""}Approval successful!`);
            await getTokenAllowance(currencyAddress, TokenSymbols[currencyAddress]);
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
            <Button
                className="pichi-button-empty min-w-[150px]"
                onPress={onOpen}
            >
                Offer
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="xl"
                onClose={() => setOfferAmount('0')}
            >
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                <div>Submit Offer</div>
                            </ModalHeader>
                            <ModalBody>
                                <div>
                  <span className="text-sm text-white-70 block mb-2">
                    Currency
                  </span>
                                    <ButtonGroup>
                                        <Button
                                            className={`${paymentCurrency === AcceptedPaymentCurrencies.WETH ? "pichi-button-empty" : "rounded-xl mr-2"}`}
                                            onClick={() => setPaymentCurrency(AcceptedPaymentCurrencies.WETH)}>WETH</Button>
                                        <Button
                                            className={`${paymentCurrency === AcceptedPaymentCurrencies.USDC ? "pichi-button-empty" : "rounded-xl ml-2"}`}
                                            onClick={() => setPaymentCurrency(AcceptedPaymentCurrencies.USDC)}>USDC</Button>
                                    </ButtonGroup>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            type="text"
                                            label="Price"
                                            placeholder="0.00"
                                            onChange={handleAmountChange}
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
                                <div>
                                    <h2 className="text-medium text-subtitle mb-2">Points</h2>
                                    <WalletPointsBreakdown showScrollbar={true}/>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                {!sufficientAllowance ? (
                                    <div className="w-full flex items-center justify-center">
                                        <Button className="pichi-button w-1/2 text-sm" color="default"
                                                disabled={loading} onClick={() => {
                                            approveTokens(false);
                                        }}>
                                            <div className="text-center text-small my-0">{allowanceLoading &&
                                                <Spinner color="default"
                                                         size={"sm"}/>}</div>
                                            Approve
                                        </Button>
                                        <Button className="pichi-button w-1/2 text-sm" disabled={loading}
                                                onClick={() => {
                                                    approveTokens(true);
                                                }}>
                                            <div className="text-center text-small my-0"> {maxAllowanceLoading &&
                                                <Spinner color="default"
                                                         size={"sm"}/>}</div>
                                            Approve Max
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="pichi-button" disabled={loading || error !== ''}
                                            onClick={submitOffer}>
                                        {loading && <Spinner color="default" size={"sm"}/>} Send Offer
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
        </>
    );
};

export default Offer;
