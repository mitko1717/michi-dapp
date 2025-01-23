import {EvmAddress} from "./address";
import {Point} from "./point";
import {ArbitrumTokenAddresses, EthereumTokenAddresses, SepoliaTokenAddresses} from "../config/contracts.config";

export interface Order {
    isStale: boolean;
    id: number;
    type: string;
    collection: string;
    currency: EthereumTokenAddresses | ArbitrumTokenAddresses | SepoliaTokenAddresses;
    participant: string;
    chainId: string;
    tokenId: number;
    amount: string;
    expiry: string;
    date: string;
    nonce: number;
    signature: string;
    is_cancelled: boolean;
    wallet: {
        wallet_address: EvmAddress;
        owner_address: EvmAddress;
    };
    points: Point[];
}

// id(pin):15
// type(pin):"LISTING"
// collection(pin):"0xd022977a22f9a681df8f3c51ed9ad144bdc5bb38"
// currency(pin):"0xc0b3b1d37cf946534a9571d74fa74eefb1bab7d1"
// participant(pin):"0x1280d2fa5ad7782e8fa291d3765863844cd11157"
// chainId(pin):"0xaa36a7"
// tokenId(pin):12
// amount(pin):"100"
// expiry(pin):"2024-12-27T13:18:47.000Z"
// date(pin):"2024-06-30T12:18:52.090Z"
// nonce(pin):3
// signature(pin):"0x1512955f94db022cc678e374646c34af20fd8ce89e523130621b21b8f291fbc81fc2afb0a05c83bd125bafd4240dad306741cc757be72b40183ae6ff7ea9e30a1b"
// is_cancelled(pin):false
