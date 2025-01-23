import React, {useEffect} from "react";
import {Button, Spinner} from "@nextui-org/react";
import {useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {MichiHelperAbi} from "../../abis/pichi";
import {MichiHelperAddress} from "../../config/michi.config";
import {toast} from "sonner";
import {NumOfConfirmationsToWaitFor} from "../../config/wagmi.config";
import {decodeEthereumLog} from "../../utils/helpers";
import {useDispatch} from "react-redux";
import {addWallet} from "../../features/wallet/walletSlice";
import {WalletClientError} from "../../types/errors";
import { track } from '@vercel/analytics';

const CreateNewWallet = () => {
    const {writeContractAsync, data: txHash} = useWriteContract();
    const [loading, setLoading] = React.useState(false);
    const account = useAccount();
    const chainId = useChainId();
    const dispatch = useDispatch();

    const {isLoading: isConfirming, isSuccess: isConfirmed, data: transactionReceipt} =
        useWaitForTransactionReceipt({
            hash: txHash,
            confirmations: NumOfConfirmationsToWaitFor,
        });

    useEffect(() => {
        if (isConfirmed) {
            const chestCreatedLogData = transactionReceipt.logs;
            const {address, nftId} = decodeEthereumLog(chestCreatedLogData);

            dispatch(addWallet({
                walletAddress: address,
                nftIndex: nftId,
                chainId: chainId,
                tokens: [],
                points: []
            }));

            toast.success("New Wallet Created 🎉");
        }
    }, [isConfirmed]);

    const createNewWallet = async () => {
        setLoading(true);
        track("Create New Wallet");
        try {
            await writeContractAsync({
                chainId: chainId,
                account: account.address,
                abi: MichiHelperAbi,
                address: MichiHelperAddress,
                functionName: "createWallet",
                args: [
                    1,
                ],
            });

        } catch (err) {
            const e = err as WalletClientError;
            console.error(e);
            toast.error(e.shortMessage);
        }

        setLoading(false);
    };

    return (
        <Button onClick={createNewWallet} className="w-full pichi-button py-5 my-4 rounded-md">
            {(loading || isConfirming) && <Spinner color="default" size={"sm"}/>} Create New Wallet
        </Button>
    );
};

export default CreateNewWallet;
