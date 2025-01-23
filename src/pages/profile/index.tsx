import React, {useEffect} from "react";
import {LayoutWithAccount} from "../../components/layout/Layout";
import Link from "next/link";
import {MARKET} from "../../routes/routes";
import {FaArrowLeft} from "react-icons/fa6";
import {useAccount, useChainId} from "wagmi";
import ListingHistory from "../../components/profile/ListingHistory";
import ReceivedOffers from "../../components/profile/ReceivedOffers";
import SentOffers from "../../components/profile/SentOffers";
import CancelListing from "../../components/marketplace/CancelListing";
import {getExplorerLink} from "../../utils/helpers";
import {PiUploadSimple} from "react-icons/pi";
import {Snippet} from "@nextui-org/react";
import {useDispatch, useSelector} from "react-redux";
import {useCancelListings} from "../../hooks/cancelListings";
import {chainIdToHex} from "../../utils/formatters";
import {getUserListings} from "../../features/user/userSlice";
import {AppState} from "../../store";

const Profile = () => {
    const {address} = useAccount();
    const user = useSelector((state: AppState) => state.user);
    const dispatch = useDispatch();
    const chainId = useChainId();

    useEffect(() => {
        if (address) {
            const _chainId = chainIdToHex(chainId);
            dispatch(getUserListings({participant: address, chainId: _chainId}));
        }
    }, [address, chainId]);

    return (
        <LayoutWithAccount>
            <div className="border-t border-b border-1 border-border-color">
                <div className="w-full max-w-7xl mx-auto p-4">
                    <Link href={MARKET} className="flex items-center">
                        <FaArrowLeft/>
                        <span className="block ml-2">Back</span>
                    </Link>
                </div>
            </div>
            <div className="w-full max-w-7xl mx-auto py-12 px-4 ">
                <h1 className="text-4xl">My Pichi Profile</h1>
                {chainId && <Snippet symbol={
                    <div className="snippet-icon">
                        <a href={getExplorerLink(chainId, address)}
                           target="_blank"
                           rel="noreferrer noopener">
                            <PiUploadSimple/>
                        </a>
                    </div>
                } variant="bordered">
                                    <span
                                        className="inline-block overflow-ellipsis overflow-hidden max-w-36 sm:max-w-full -mb-1.5">
                                        {address as unknown as String}
                                    </span>
                </Snippet>}
                <div className="border-b-1.5 border-border-color my-8"/>
                <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row mb-6">
                    <h2 className="text-2xl">Listing History</h2>
                    <CancelListing cancelAll={true} totalListings={user.listings?.filter(listing => !listing.is_cancelled)}/>
                </div>
                <ListingHistory/>
                <h2 className="text-2xl mt-12 mb-5">Recieved Offers</h2>
                <ReceivedOffers/>
                <h2 className="text-2xl mt-12 mb-5">Sent Offers</h2>
                <SentOffers/>
            </div>
        </LayoutWithAccount>
    );
};

export default Profile;
