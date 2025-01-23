import {TokenboundClient} from "@tokenbound/sdk";
import {useWalletClient} from "wagmi";
import {ChainId} from "../types/chain";
import {mantle} from "viem/chains";

export function initializeTokenboundClient(chainId: ChainId): TokenboundClient | null {
    const {data: walletClient} = useWalletClient({
        chainId,
    });
    switch (chainId) {
        case ChainId.ARBITRUM:
            return new TokenboundClient({
                walletClient: walletClient as any,
                chainId,
            });
        case ChainId.SEPOLIA:
            return new TokenboundClient({
                walletClient: walletClient as any,
                chainId,
            });
        case ChainId.MANTLE:
            return new TokenboundClient({
                walletClient: walletClient as any,
                chain: mantle,
            });
        case ChainId.OPTIMISM:
            return new TokenboundClient({
                walletClient: walletClient as any,
                chainId,
            });
        case ChainId.ETHEREUM:
            return new TokenboundClient({
                walletClient: walletClient as any,
                chainId,
            });
        default:
            console.warn(`Unsupported chain ID: ${chainId}`);
            return null;
    }
}