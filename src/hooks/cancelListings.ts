// hooks/useCancelListings.ts
import { useState } from 'react';
import { useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { toast } from 'sonner';
import {PichiMarketAbi} from "../abis/pichi";
import {PichiMarketplaceAddress} from "../config/michi.config";
import {NumOfConfirmationsToWaitFor} from "../config/wagmi.config";
import {EvmAddress} from "../types/address";
import {ChainId} from "../types/chain";

export const useCancelListings = () => {
    const [selectedListings, setSelectedListings] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const config = useConfig();

    const toggleListingSelection = (nonce: string) => {
        setSelectedListings(prev =>
            prev.includes(nonce)
                ? prev.filter(n => n !== nonce)
                : [...prev, nonce]
        );
    };

    const cancelSelectedListings = async (address: EvmAddress, chainId: ChainId) => {
        if (selectedListings.length === 0) {
            toast.error('No listings selected');
            return;
        }

        setLoading(true);
        try {
            const tx = await writeContractAsync({
                account: address as `0x${string}`,
                abi: PichiMarketAbi,
                chainId,
                address: PichiMarketplaceAddress,
                functionName: 'cancelOrdersForCaller',
                args: [selectedListings],
            });

            const transactionReceipt = await waitForTransactionReceipt(config, {
                hash: tx as `0x${string}`,
                confirmations: NumOfConfirmationsToWaitFor
            });

            if (transactionReceipt.status === 'success') {
                toast.success('Selected listings canceled successfully!');
                setSelectedListings([]);
            } else {
                toast.error('Transaction failed');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return {
        selectedListings,
        toggleListingSelection,
        cancelSelectedListings,
        loading
    };
};