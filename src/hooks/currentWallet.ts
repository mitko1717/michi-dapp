import {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useChainId} from "wagmi";

import {AppState} from "../store";
import {getFromMichiApi} from "../utils/api";
import {chainIdToHex, hexToChainId} from "../utils/formatters";
import {
    getCurrentWallet,
    getCurrentWalletListings,
    getCurrentWalletPoints,
    getCurrentWalletTokens,
    setCurrentWallet
} from "../features/wallet/walletSlice";
import {EvmAddress} from "../types/address";

export const useWalletData = (nid: EvmAddress) => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const chainId = useChainId();
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const fetchedRef = useRef(false);

    const fetchListings = useCallback((tokenId: number) => {
        const _chainId = chainIdToHex(chainId);
        dispatch(getCurrentWalletListings({chainId: _chainId, tokenId}));
    }, [dispatch]);

    const fetchNFT = useCallback(async () => {
        if (!nid || fetchedRef.current) return;

        setLoading(true);
        try {
            const {data} = await getFromMichiApi(`v1/nft/lookup/${nid}`);
            const _wallet = {
                walletAddress: nid,
                nftIndex: String(data.nftIndex),
                chainId: hexToChainId(data.chainId),
            };
            dispatch(setCurrentWallet(_wallet));
            dispatch(getCurrentWallet(nid));
            dispatch(getCurrentWalletPoints(nid as EvmAddress));
            dispatch(getCurrentWalletTokens({chainId, walletAddress: nid as EvmAddress}));
            fetchListings(Number(_wallet.nftIndex));
            fetchedRef.current = true;
        } catch (e) {
            console.error(e);
            dispatch(setCurrentWallet(undefined));
        } finally {
            setLoading(false);
        }
    }, [nid, chainId, dispatch]);

    useEffect(() => {
        if (nid) {
            fetchedRef.current = false;
            fetchNFT();
        }
    }, [nid, fetchNFT]);

    return {loading, currentWallet};
};