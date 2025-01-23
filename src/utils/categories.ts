import {ChainId} from "../types/chain";

const EthCategories = [{
    name: "Pendle YT",
    symbols: ["yt"],
},
    {
        name: "Pendle PT",
        symbols: ["pt"],
    },
    {
        name: "Pendle LPT",
        symbols: ["lpt"],
    },
    {
        name: "Ethena",
        symbols: ["ena", "usde", "susde"],
    },
    {
        name: "ETH LRT",
        symbols: ["eETH", "weETH", "rsETH", "ezETH", "pufETH", "rswETH", "uniETH"]
    },
    {
        name: "BTC LRT",
        symbols: ["eBTC", "pumpBTC", "uniBTC", "solvBTC.BBN", "LBTC"]
    }
];

const ArbCategories = [
    {
        name: "Pendle YT",
        symbols: ["yt"],
    },
    {
        name: "Pendle PT",
        symbols: ["pt"],
    },
    {
        name: "Pendle LPT",
        symbols: ["lpt"],
    },
    {
        name: "Ethena",
        symbols: ["ena", "usde", "susde"],
    },
    {
        name: "LRT",
        symbols: ["eETH", "weETH", "rsETH", "ezETH", "pufETH", "rswETH", "uniETH"]
    }
];

export const getCategoriesFromChain = (chainId: ChainId) => {
    if (chainId === 1) {
        return EthCategories;
    } else if (chainId === 42161) {
        return ArbCategories;
    }
    return [];
};