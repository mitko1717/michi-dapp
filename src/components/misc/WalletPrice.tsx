import React, {useMemo} from "react";
import {Order} from "../../types/order";
import {TokenDecimals, TokenSymbols} from "../../config/contracts.config";
import {ethers} from "ethers";
import {Wallet} from "../../types/wallet";

interface OrderProps {
    order?: Order;
    wallet?: Wallet;
}

// Define the type for TokenSymbols and TokenDecimals keys
type TokenConfigKey = keyof typeof TokenSymbols & keyof typeof TokenDecimals;

const WalletPrice: React.FC<OrderProps> = ({order, wallet}) => {
    const unStaleListing = useMemo(() => {
        if (wallet?.listings && wallet.listings.length > 0) {
            return wallet.listings.find((listing) => listing?.isStale === false
            );
        }
        return null;
    }, [wallet?.listings]);

    const currency: string = (unStaleListing?.currency || order?.currency || "ETH").toLowerCase();
    const amount: string = unStaleListing?.amount || order?.amount || "0";

    const getTokenSymbol = (address: string, checkSymbols: boolean): string | number => {
        const normalizedAddress = address.toLowerCase();
        let check = checkSymbols ? TokenSymbols : TokenDecimals;
        for (const key in check) {
            if (key.toLowerCase() === normalizedAddress) {
                return check[key];
            }
        }
        return checkSymbols ? "ETH" : 18;
    }
    const tokenSymbol = getTokenSymbol(currency, true);
    const decimals = getTokenSymbol(currency, false);

    let formattedAmount: number;
    try {
        formattedAmount = parseFloat(ethers.utils.formatUnits(amount, decimals));
    } catch (error) {
        console.error("Error formatting amount:", error);
        formattedAmount = 0; // Default to 0 if there's an error
    }

    const displayAmount = TokenSymbols[currency as TokenConfigKey] !== "WETH"
        ? formattedAmount < 0.01 ? "<0.01" : formattedAmount.toFixed(2)
        : formattedAmount < 0.0001 ? "<0.0001" : formattedAmount.toFixed(4);

    return (
        <span className="flex items-center">
            <img
                src={`/assets/logos/${tokenSymbol === "WETH" ? "eth" : typeof tokenSymbol === "string" && tokenSymbol?.toLowerCase()}.png`}
                alt="Logo" className="h-5 mr-1"/>
            {displayAmount} {tokenSymbol === "WETH" ? "ETH" : tokenSymbol}
            {/*<button onClick={test}>test</button>*/}
        </span>
    );
};

export default WalletPrice;