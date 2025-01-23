import {Core} from "@walletconnect/core";
import {IWeb3Wallet, Web3Wallet, Web3WalletTypes} from "@walletconnect/web3wallet";
import {ICore} from "@walletconnect/types";
import {formatJsonRpcResult, JsonRpcResult} from "@walletconnect/jsonrpc-utils";
import {ethers} from "ethers";
import {buildTypedData, encodeTypedDataDigest} from "../../utils/typedDataUtils";
import {generateApprovedNamespaces} from "../../config/walletConnect.config";
import {Wallet} from "../../types/wallet";
import {TokenboundClient} from "@tokenbound/sdk";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId) {
    throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

let web3walletPromise: Promise<IWeb3Wallet> | null = null;
let eventListenersAttached = false;

let walletInstance: Wallet | null = null;
let tokenboundClientInstance: TokenboundClient | null = null;
let switchChainAsyncFunction: ((args: { chainId: number }) => Promise<void>) | null = null;
let chainId: number | null = null;

export function initializeWeb3walletDependencies(
    wallet: Wallet,
    tokenboundClient: TokenboundClient,
    switchChainAsync: (args: { chainId: number }) => Promise<void>,
    chainId: number
): void {
    walletInstance = wallet;
    tokenboundClientInstance = tokenboundClient;
    switchChainAsyncFunction = switchChainAsync;
    chainId = chainId;
}

export function getWeb3walletInstance(): Promise<IWeb3Wallet> {
    if (!web3walletPromise) {
        console.log("Initializing web3wallet");
        web3walletPromise = Web3Wallet.init({
            core: new Core({
                projectId: walletConnectProjectId,
            }) as ICore,
            metadata: {
                name: "Pichi Wallet",
                description: "Pichi Wallet Dapp",
                url: "https://app.michiwallet.com/",
                icons: [],
            },
        }).then((web3wallet) => {
            if (!eventListenersAttached) {
                attachEventListeners(web3wallet);
                eventListenersAttached = true;
            }
            return web3wallet;
        });
    }
    return web3walletPromise;
}

function attachEventListeners(web3wallet: IWeb3Wallet): void {
    web3wallet.on("session_proposal", onSessionProposal);
    web3wallet.on("session_request", onSessionRequest);
}

type SignParams = Array<`0x${string}` | Uint8Array>;

function getSignParamsMessage(params: SignParams): `0x${string}` | Uint8Array {
    return params[0];
}

function getSignTypedDataParamsData(
    params: Web3WalletTypes.SessionRequest["params"]["request"]["params"]
): {
    account: string;
    domain: any;
    types: any;
    message: any;
    primaryType: string;
} {
    if (params.length < 2) throw new Error("Invalid eth_signTypedData_v4 parameters");

    const account = params[0];
    const data = JSON.parse(params[1]);

    const {domain, types, message, primaryType} = data;

    if (!domain || !types || !message || !primaryType) {
        throw new Error("Invalid EIP-712 data structure");
    }

    const primaryTypeCleaned = primaryType.split(":").pop() || primaryType;
    const filteredTypes = {
        EIP712Domain: types.EIP712Domain,
        [primaryTypeCleaned]: types[primaryType] || types[primaryTypeCleaned],
    };

    if (!filteredTypes[primaryTypeCleaned]) {
        throw new Error(`Type ${primaryTypeCleaned} is missing in the types object`);
    }

    return {
        account,
        domain,
        types: filteredTypes,
        message,
        primaryType: primaryTypeCleaned,
    };
}

async function onSessionProposal({
                                     id,
                                     params,
                                 }: Web3WalletTypes.SessionProposal): Promise<void> {
    try {
        if (!walletInstance) throw new Error("Wallet instance is not initialized");
        const approvedNamespaces = generateApprovedNamespaces(params, walletInstance);

        const web3wallet = await getWeb3walletInstance();
        await web3wallet.approveSession({
            id,
            namespaces: approvedNamespaces,
        });

    } catch (error) {
        console.error("Error in onSessionProposal:", error);
    }
}

async function onSessionRequest({
                                    topic,
                                    params,
                                    id,
                                }: Web3WalletTypes.SessionRequest): Promise<void> {
    try {
        if (!walletInstance) throw new Error("Wallet instance is not initialized");
        if (!tokenboundClientInstance) throw new Error("Tokenbound client is not initialized");
        if (!switchChainAsyncFunction) throw new Error("Switch chain function is not initialized");

        const {request} = params;
        if (!request || !request.params || !request.params[0]) {
            throw new Error("Invalid request parameters");
        }
        let response: JsonRpcResult | undefined;

        const chainIdNum = parseInt(params.chainId.split(":")[1], 10);

        switch (request.method) {
            case "personal_sign":
                console.log("personal_sign");
                const personalMessage = getSignParamsMessage(request.params as SignParams);
                const signedMessage = await tokenboundClientInstance.signMessage({
                    message: {raw: personalMessage},
                });
                response = formatJsonRpcResult(id, signedMessage);
                break;

            case "eth_signTypedData_v4":
                console.log("eth_signTypedData_v4");
                const {
                    account,
                    domain,
                    types,
                    message,
                    primaryType,
                } = getSignTypedDataParamsData(request.params);
                const typedData = buildTypedData(domain, types, primaryType, message);
                const digest = encodeTypedDataDigest(typedData);
                const digestHex = ethers.utils.hexlify(digest);
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                const signer = provider.getSigner();
                const signature = await signer.signMessage(digestHex);
                response = formatJsonRpcResult(id, signature);
                break;

            default:
                console.log("default");
                await switchChainAsyncFunction({chainId: walletInstance.chainId});
                console.log("switched chain");
                const hash = await tokenboundClientInstance.execute({
                    account: request.params[0].from,
                    to: request.params[0].to,
                    value: BigInt(0),
                    data: request.params[0].data,
                    chainId: chainIdNum,
                });
                response = formatJsonRpcResult(id, hash);
                break;
        }

        if (response) {
            const web3wallet = await getWeb3walletInstance();
            await web3wallet.respondSessionRequest({
                topic,
                response,
            });
        }
    } catch (e) {
        console.error("Error in onSessionRequest:", e);

        if (e instanceof Error) {
            const errorMessage = {
                id,
                error: {code: 4001, message: e.message},
                jsonrpc: "2.0",
            };
            const web3wallet = await getWeb3walletInstance();
            await web3wallet.respondSessionRequest({
                topic,
                response: errorMessage,
            });
        }
    }
}
