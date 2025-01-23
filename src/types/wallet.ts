import {ChainId} from "./chain";
import {Token} from "./token";
import {Point} from "./point";
import {EvmAddress} from "./address";
import {Order} from "./order";

export interface Wallet {
    chainId: ChainId,
    walletAddress: EvmAddress,
    nftIndex: string,
    tokens?:  Token[],
    points?: Point[],
    offers?: Order[],
    listings?: Order[],
    price?: string | null,
    currency?: EvmAddress,
}