import {buildApprovedNamespaces} from "@walletconnect/utils";
import {Wallet} from "../types/wallet";

export const generateApprovedNamespaces = (params: any, wallet: Wallet) => buildApprovedNamespaces({
    proposal: params,
    supportedNamespaces: {
        eip155: {
            chains: ["eip155:1", "eip155:42161"],
            methods: ["eth_sendTransaction", "personal_sign","eth_signTypedData_v4","eth_signTypedData"],
            events: ["accountsChanged", "chainChanged"],
            accounts: [
                `eip155:1:${wallet.walletAddress}`,
                `eip155:42161:${wallet.walletAddress}`,
            ]
        }
    }
});
