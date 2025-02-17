import React, { useEffect, useRef, useState } from "react";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Snippet,
    useDisclosure
} from "@nextui-org/react";
import { formatJsonRpcResult, JsonRpcResult } from "@walletconnect/jsonrpc-utils";
import { Wallet } from "../../types/wallet";
import { useChainId, useSwitchChain } from "wagmi";
import { initializeTokenboundClient } from "../../hooks/useTokenboundClient";
import { getWeb3walletInstance, initializeWeb3walletDependencies } from "./web3wallet";
import { IWeb3Wallet, Web3WalletTypes } from "@walletconnect/web3wallet";
import { generateApprovedNamespaces } from "../../config/walletConnect.config";
import { buildTypedData, encodeTypedDataDigest } from "../../utils/typedDataUtils";
import { ethers } from "ethers";

type Props = {
    wallet: Wallet
}

const ConnectWallet: React.FC<Props> = ({ wallet }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isConnected, setIsConnected] = useState(false);
    const [uri, setUri] = useState<string>("");
    const [connectedAddress, setConnectedAddress] = useState<string>("");
    const [topic, setTopic] = useState<string>("");

    const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    if (!walletConnectProjectId) {
        throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
    }
    const tokenboundClient = initializeTokenboundClient(wallet.chainId);
    const { switchChainAsync } = useSwitchChain();
    const chainId = useChainId();

    const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet | null>(null);

    useEffect(() => {
        getWeb3walletInstance()
            .then((wallet) => {
                setWeb3Wallet(wallet);
            })
            .catch((error) => {
                console.error("Error initializing web3wallet:", error);
            });
    }, [chainId]);

    useEffect(() => {
        if (web3wallet) {
            web3wallet.on("session_proposal", onSessionProposal);
            web3wallet.on("session_request", onSessionRequest);
        }

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            if (web3wallet) {
                web3wallet.off("session_proposal", onSessionProposal);
                web3wallet.off("session_request", onSessionRequest);
            }
        };
    }, [web3wallet, onSessionProposal, onSessionRequest]);

    async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
        try {
            const approvedNamespaces = generateApprovedNamespaces(params, wallet);

            const session = await web3wallet?.approveSession({
                id,
                namespaces: approvedNamespaces
            });

            if (session) {
                const accountString = session.namespaces.eip155.accounts[0];
                const address = accountString.split(':')[2];
                setConnectedAddress(address);
            }

            web3wallet?.on("session_proposal", async proposal => {
                const session = await web3wallet?.approveSession({
                    id: proposal.id,
                    namespaces: approvedNamespaces
                });
            });
        } catch (error) {
            // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
            // await web3wallet.rejectSession({
            //     id: 1,
            //     reason: getSdkError("USER_REJECTED")
            // })
        }
    }

    function getSignParamsMessage(params: any) {
        return params[0];
    }

    function getSignTypedDataParamsData(params: Web3WalletTypes.SessionRequest['params']['request']['params']) {
        try {


        }
        catch (e) {

        }
        if (params.length < 2) throw new Error("Invalid eth_signTypedData_v4 parameters");

        const account = params[0];
        const data = JSON.parse(params[1]);

        const { domain, types, message, primaryType } = data;

        if (!domain || !types || !message || !primaryType) {
            throw new Error("Invalid EIP-712 data structure");
        }

        const primaryTypeCleaned = primaryType.split(':').pop();
        const filteredTypes = {
            EIP712Domain: types.EIP712Domain,
            [primaryTypeCleaned]: types[primaryType] || types[primaryTypeCleaned]
        };

        if (!filteredTypes[primaryTypeCleaned]) {
            throw new Error(`Type ${primaryTypeCleaned} is missing in the types object`);

        }

        return {
            account,
            domain,
            types: filteredTypes,
            message,
            primaryType: primaryTypeCleaned
        };
    }

    async function onSessionRequest({ topic, params, id }: Web3WalletTypes.SessionRequest) {
        try {
            const { request } = params;
            if (!request || !request.params || !request.params[0]) {
                throw new Error("Invalid request parameters");
            }
            let response;

            const chainIdNum = parseInt(params.chainId.split(':')[1], 10);
            switch (request.method) {
                case 'personal_sign':
                    if (!tokenboundClient) throw new Error("Tokenbound client not initialized");
                    let personalMessage = getSignParamsMessage(request.params);
                    const signedMessage = await tokenboundClient.signMessage({ message: { raw: personalMessage } })
                    response = formatJsonRpcResult(id, signedMessage);
                    break;
                case 'eth_signTypedData_v4':
                    const { account, domain, types, message, primaryType } = getSignTypedDataParamsData(request.params);
                    const typedData = buildTypedData(domain, types, primaryType, message);
                    const digest = encodeTypedDataDigest(typedData);
                    const digestHex = ethers.utils.hexlify(digest);
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const signature = await signer.signMessage(digestHex);
                    response = formatJsonRpcResult(id, signature);
                    break;
                default:
                    await switchChainAsync({ chainId: wallet.chainId });
                    const hash = await tokenboundClient?.execute({
                        account: request.params[0].from,
                        to: request.params[0].to,
                        value: BigInt(0),
                        data: request.params[0].data,
                        chainId: chainIdNum
                    });
                    response = formatJsonRpcResult(id, hash);
                    await switchChainAsync({ chainId });
                    break;
            }
        } catch (e) {
            console.error("error onSessionRequest:", e);
            await switchChainAsync({ chainId });

            if (e instanceof Error) {
                const errorMessage = { id, error: { code: 4001, message: e.message }, jsonrpc: "2.0" };
                console.error("Error Response:", errorMessage);

                if (e.message.includes("User denied transaction signature")) {
                    console.error("User denied the transaction signature.");
                }

                web3wallet?.respondSessionRequest({
                    topic,
                    response: errorMessage,
                });
            }
        }
    }

    const connect = async () => {
        try {
            console.log("Connecting...");
            const web3wallet = await getWeb3walletInstance();
            if (uri) {
                const { topic } = await web3wallet.core.pairing.pair({
                    uri: uri,
                    activatePairing: true,
                });
                if (topic) {
                    setIsConnected(true);
                    setTopic(topic);
                }
            }
        } catch (error: any) {
            console.error("Connection failed:", error);
        }
    };

    const handleButtonClick = async () => {
        if (isConnected) {
            try {
                console.log("Disconnecting...");
                const web3wallet = await getWeb3walletInstance();
                if (topic) {
                    await web3wallet.core.pairing.disconnect({ topic: topic });
                }
                setIsConnected(false);
                setUri("");
                setConnectedAddress("");
            } catch (error) {
                console.error("Disconnection failed:", error);
            }
        } else {
            await connect();
        }
    };

    return (
        <div>
            <Button
                onClick={onOpen}
                className="michi-transparent-button w-full"
            >
                {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent className="modal">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                <div className="flex flex-row items-center">
                                    <span className="text-white">Connect Wallet</span>
                                </div>
                                {isConnected && connectedAddress &&
                                    <div className="mt-3 text-white"><Snippet hideSymbol={true}
                                    >{connectedAddress}</Snippet></div>}
                            </ModalHeader>
                            <ModalBody>
                                <Input type="text" placeholder="URI" className="my-4" value={uri} disabled={isConnected}
                                    onChange={(e) => setUri(e.target.value)} />
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={handleButtonClick} className="michi-button w-full"
                                >{isConnected ? "Disconnect" : "Connect"}</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
    ;

export default ConnectWallet;
