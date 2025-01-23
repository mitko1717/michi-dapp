import {getDefaultConfig} from "@rainbow-me/rainbowkit";
import {arbitrum, mainnet, mantle, optimism, sepolia} from "wagmi/chains";
import {http} from "wagmi";
import {defineChain} from "viem";

export const sonicTestnet = defineChain({
    id: 64165,
    name: "Sonic Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Sonic",
        symbol: "S",
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.testnet.soniclabs.com"]
        },
    },
    blockExplorers: {
        default: {name: "Explorer", url: "https://testnet.soniclabs.com"},
    },
    contracts: {
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
            blockCreated: 5882,
        },
    },
});

export const WagmiConfig = getDefaultConfig({
    appName: "Pichi",
    appDescription: "Trade your airdrop points with ease",
    appUrl: "https://app.pichi.finance",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: process.env.NEXT_PUBLIC_TESTNET_ENABLED === "true" ? [mainnet, arbitrum, sepolia, optimism, mantle, sonicTestnet] : [mainnet, arbitrum, mantle],
    transports: {
        [mainnet.id]: http(
            "https://lb.drpc.org/ogrpc?network=ethereum&dkey=AvM7kbbCQE_wtg3gyulIGctkFcJh9VsR7pPangOF84-p"
        ),
        [arbitrum.id]: http(
            "https://lb.drpc.org/ogrpc?network=arbitrum&dkey=AvM7kbbCQE_wtg3gyulIGctkFcJh9VsR7pPangOF84-p"
        ),
        // [optimism.id]: http(),
        [sepolia.id]: http("https://lb.drpc.org/ogrpc?network=sepolia&dkey=AvM7kbbCQE_wtg3gyulIGctkFcJh9VsR7pPangOF84-p"),
        [mantle.id]: http("https://lb.drpc.org/ogrpc?network=mantle&dkey=AvM7kbbCQE_wtg3gyulIGctkFcJh9VsR7pPangOF84-p"),
    },
});

export const NumOfConfirmationsToWaitFor = 1;