import {ChainId} from "./chain";

export type LeaderboardChainData = {
    chain: string;
    chainId: ChainId;
    points: string;
};

export type LeaderboardUser = {
    position: number;
    address: `0x${string}`;
    totalPoints: string;
    chainData: LeaderboardChainData[];
};