import {ChainId} from "./chain";

export  type Token = {
    chainId: ChainId;
    tokenAddress: `0x${string}`;
    name: string;
    symbol: string;
    balance: string;
    decimals: number;
    eligibleForInterest?: boolean;
}

export const MaxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export  type ApprovedToken = {
    id: number;
    chain_id: ChainId;
    address: `0x${string}`;
    address_label: string | null;
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    logo_hash: string | null;
    thumbnail: string | null;
    block_number: number;
    validated: number;
    created_at: string;
    possible_spam: boolean;
    verified_contract: boolean;
}

export const EthereumBonuses = {
    // "0x7C2D26182adeEf96976035986cF56474feC03bDa": ["3x Michi Points"],
    // "0xfb35Fd0095dD1096b1Ca49AD44d8C5812A201677": ["3x Michi Points"],
    // "0x129e6B5DBC0Ecc12F9e486C5BC9cDF1a6A80bc6A": ["3x Michi Points"],
    // "0x5439c3Ef0072e4A19C44478CDF947F5d957e66C7": ["3x Michi Points"],
    // "0xA54Df645A042D24121a737dAA89a57EbF8E0b71c": ["3x Michi Points"],
    // "0x35fA164735182de50811E8e2E824cFb9B6118ac2": ["3x Michi Points"],
    // "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee": ["3x Michi Points"]
};

export const ArbitrumBonuses = {
    // "0xDcdC1004d5C271ADc048982d7EB900cC4F472333": ["3x Michi Points"],
    // "0xfB2A7AC0372C2425c273932f8d438518402A873E": ["3x Michi Points"],
    // "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe": ["3x Michi Points"]
};

