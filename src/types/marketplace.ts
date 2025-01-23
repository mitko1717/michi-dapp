import {ArbitrumTokenAddresses, EthereumTokenAddresses, SepoliaTokenAddresses} from "../config/contracts.config";

export type PaymentCurrencyAddress = EthereumTokenAddresses | ArbitrumTokenAddresses | SepoliaTokenAddresses;
export enum AcceptedPaymentCurrencies {
    WETH = "WETH",
    USDC = "USDC",
    USDT = "USDT"
}
