import React from "react";
import {ArbitrumBonuses, EthereumBonuses, Token} from "../../types/token";
import {ChainId} from "../../types/chain";
import {GiStarShuriken} from "react-icons/gi";

type Props = {
    chainId: ChainId,
    token: Token
}

type Bonuses = {
    [address: string]: string[];
};
const BonusTags: React.FC<Props> = ({chainId, token}) => {
    const normalizeKeysToLowercase = (obj: Bonuses): Bonuses => {
        return Object.keys(obj).reduce((acc: Bonuses, key: string) => {
            acc[key.toLowerCase()] = obj[key];
            return acc;
        }, {});
    };

    let _EthereumBonuses = normalizeKeysToLowercase(EthereumBonuses);
    let _ArbitrumBonuses = normalizeKeysToLowercase(ArbitrumBonuses);
    const normalizedAddress = token.tokenAddress.toLowerCase();

    const bonuses = chainId === 1 ? _EthereumBonuses[normalizedAddress] : _ArbitrumBonuses[normalizedAddress];

    return (
        <div>
            {bonuses ? bonuses.map((bonus: string, index: number) =>
                <div key={index} className="text-tiny deposit-points-indicator p-1 mt-2 rounded inline-flex items-center justify-center"><span className="text-[#F39983] mr-1 text-lg"><GiStarShuriken /></span>{bonus}</div>
            ) : null}
        </div>
    );
};

export default BonusTags;
