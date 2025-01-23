import {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getFromMichiApi} from "../utils/api";
import {chainIdToHex, hexToChainId} from "../utils/formatters";
import {
    getCurrentWallet,
    getCurrentWalletOffers,
    getCurrentWalletPoints,
    getCurrentWalletTokens,
    setCurrentWallet
} from "../features/wallet/walletSlice";
import {setCurrentOrder} from "../features/marketplace/marketplaceSlice";
import {EvmAddress} from "../types/address";
import {AppState} from "../store";
import {ChainId} from "../types/chain";
import {Wallet} from "../types/wallet";


export const useNFTDataAndOffers = (wid: EvmAddress | undefined, chainId: ChainId) => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const offers = useSelector((state: AppState) => state.wallet.currentWallet?.offers);
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);

    const fetchPointsAndTokens = useCallback((walletAddress: EvmAddress, chainId: number) => {
        dispatch(getCurrentWalletPoints(walletAddress));
        dispatch(getCurrentWalletTokens({chainId, walletAddress}));
    }, [dispatch]);

    const fetchOffers = useCallback(( tokenId: number) => {
        const _chainId = chainIdToHex(chainId);
        dispatch(getCurrentWalletOffers({chainId: _chainId, tokenId}));
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            if (!wid || !chainId) return;

            try {
                // Fetch NFT data
                const { data } = await getFromMichiApi(`v1/nft/lookup/${wid}`);
                const _wallet: Wallet = {
                    walletAddress: wid as unknown as EvmAddress,
                    nftIndex: String(data.nftIndex),
                    chainId: hexToChainId(data.chainId),
                };
                dispatch(setCurrentWallet(_wallet));
                dispatch(getCurrentWallet(wid as unknown as EvmAddress));
                dispatch(setCurrentOrder(wid as unknown as EvmAddress));
                setLoading(false);

                fetchOffers( Number(_wallet.nftIndex));
                fetchPointsAndTokens(_wallet.walletAddress, chainId);
            } catch (e) {
                dispatch(setCurrentWallet(undefined));
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [wid, chainId, dispatch, fetchPointsAndTokens]);

    useEffect(() => {
        if (michiWallets && michiWallets.length > 0 && wid && chainId && !currentWallet) {
            fetchPointsAndTokens(wid as unknown as EvmAddress, chainId);
        }
    }, [michiWallets, wid, chainId, currentWallet, fetchPointsAndTokens]);

    return {loading, currentWallet, offers, fetchOffers};
};