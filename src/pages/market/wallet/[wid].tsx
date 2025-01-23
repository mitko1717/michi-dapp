import React from "react";
import {useRouter} from "next/router";
import {LayoutWithAccount} from "../../../components/layout/Layout";
import {useSelector} from "react-redux";
import {AppState} from "../../../store";
import {FaArrowLeft} from "react-icons/fa6";
import Link from "next/link";
import {MARKET} from "../../../routes/routes";
import WalletPointsBreakdown from "../../../components/points/walletPointsBreakdown";
import {useAccount, useChainId} from "wagmi";
import RecentTransactions from "../../../components/wallet/RecentTransactions";
import CurrentOffers from "../../../components/marketplace/CurrentOffers";
import BuyNow from "../../../components/marketplace/BuyNow";
import Offer from "../../../components/marketplace/Offer";
import BetaIzation from "../../../components/marketplace/BetaIzation";
import {Snippet, Spinner} from "@nextui-org/react";
import WalletPrice from "../../../components/misc/WalletPrice";
import {useNFTDataAndOffers} from "../../../hooks/currentWalletMarketplace";
import {EvmAddress} from "../../../types/address";
import {getExplorerLink} from "../../../utils/helpers";
import {PiUploadSimple} from "react-icons/pi";

const Index = () => {
    const router = useRouter();
    const {wid} = router.query;
    const currentOrder = useSelector((state: AppState) => state.marketplace.currentOrder);
    const chainId = useChainId();
    const {currentWallet, loading} = useNFTDataAndOffers(wid as EvmAddress, chainId);
    const {address} = useAccount();

    return (
        <LayoutWithAccount>
            {/*<BetaIzation/>*/}
            {loading ?
                <div className="w-full max-w-7xl mx-auto p-4">
                    <Spinner color="default" size={"lg"}/>
                </div> :
                <div>
                    <div className="border-t border-b border-1 border-border-color">
                        <div className="w-full max-w-7xl mx-auto p-4">
                            <Link href={MARKET} className="flex items-center">
                                <FaArrowLeft/>
                                <span className="block ml-2">Back</span>
                            </Link>
                        </div>
                    </div>
                    <div className="w-full max-w-7xl mx-auto p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between my-12">
                            <div>
                                <h2 className="text-4xl">Pichi Wallet #{currentWallet?.nftIndex}</h2>
                                {currentWallet?.chainId && <Snippet symbol={
                                    <div className="snippet-icon">
                                        <a href={getExplorerLink(currentWallet?.chainId, currentWallet?.walletAddress)}
                                           target="_blank"
                                           rel="noreferrer noopener">
                                            <PiUploadSimple/>
                                        </a>
                                    </div>
                                } variant="bordered">
                                    <span
                                        className="inline-block overflow-ellipsis overflow-hidden max-w-36 sm:max-w-full -mb-1.5">
                                        {currentWallet?.walletAddress as unknown as String}
                                    </span>
                                </Snippet>}
                            </div>
                            <div className="p-4 flex flex-col sm:flex-row justify-center items-center">
                                <div
                                    className={`${currentOrder?.participant?.toLowerCase() != address?.toLowerCase() ? "sm:border-r-2 border-border-color py-2 px-4 mr-4" : "py-2 px-4 mr-4"}`}>
                                    {currentOrder && <div className="flex">
                                        <strong className="mr-1">Current Price:</strong><WalletPrice
                                        order={currentOrder}/>
                                    </div>}
                                </div>
                                {currentOrder?.participant?.toLowerCase() != address?.toLowerCase() &&
                                    <><BuyNow/>
                                        <div className="mt-2 sm:mt-0 sm:ml-2">
                                            <Offer/>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="my-12">
                            <p className="mb-4">Points</p>
                            <WalletPointsBreakdown/>
                        </div>
                        <div className="my-12">
                            <p className="mb-4">Current Offers</p>
                            <CurrentOffers/>
                        </div>
                        {currentWallet && <div className="my-12">
                            <p className="mb-4">Recent Transactions From This Wallet</p>
                            <RecentTransactions wallet={currentWallet}/>
                        </div>}
                    </div>
                </div>}
        </LayoutWithAccount>
    );
};

export default Index;
