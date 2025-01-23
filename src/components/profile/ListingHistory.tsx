import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {useAccount, useChainId} from "wagmi";
import {
    Button,
    Checkbox,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import dayjs from "dayjs";
import {GoDotFill} from "react-icons/go";
import {Order} from "../../types/order";
import WalletPrice from "../misc/WalletPrice";
import CancelListing from "../marketplace/CancelListing";
import {useCancelListings} from "../../hooks/cancelListings";


const ListingHistory = ({showScrollbar = true}) => {
    const user = useSelector((state: AppState) => state.user);
    const {address} = useAccount();
    const chainId = useChainId();
    const {selectedListings, toggleListingSelection, cancelSelectedListings, loading} = useCancelListings();

    if (user?.listingsStatus === "loading") {
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

    if (!user?.listings || user?.listings?.length === 0) {
        return <div className="pichi-card">
            <p className="text-center text-lg my-12">No listings yet</p>
        </div>;
    }

    return (
        <div>
            <Table removeWrapper aria-label="Listing History"
                   className={`text-white border-1 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl  ${showScrollbar ? 'max-h-96 overflow-y-auto scrollbar-thin' : 'overflow-hidden'}`}
            >
                <TableHeader>
                    <TableColumn className="bg-transparent py-5">Select</TableColumn>
                    <TableColumn className="bg-transparent px-6 py-5">Time</TableColumn>
                    <TableColumn className="bg-transparent py-5">Listed Price</TableColumn>
                    <TableColumn className="bg-transparent py-5">Status</TableColumn>
                    <TableColumn className="bg-transparent py-5"> </TableColumn>
                </TableHeader>
                <TableBody>
                    {user.listings?.filter(listing => !listing.is_cancelled)?.map((listing: Order, index: number) =>
                        <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                            <TableCell className="">
                                <Checkbox
                                    isSelected={selectedListings.includes(String(listing.nonce))}
                                    onValueChange={() => toggleListingSelection(String(listing.nonce))}
                                    classNames={{
                                        wrapper: "border-2 border-border-color",
                                        base: "ml-1",
                                    }}
                                />
                            </TableCell>
                            <TableCell className="px-6 py-5 flex items-center">
                                 <span
                                     className="w-10 h-10 rounded-full mr-2 flex justify-center items-center icon-custom icon-container">
                                     <img src="/logo.png" alt="Chain Logo"
                                          className="h-1/2"/>
                                </span>
                                PICHI WALLET NFT # {listing.tokenId}
                            </TableCell>
                            <TableCell className="py-5"><WalletPrice order={listing}/></TableCell>
                            <TableCell className="justify-center">
                                <div
                                    className={`inline-flex items-end text-lg ${dayjs().isAfter(dayjs(listing.expiry)) ? "text-red-600" : "text-green-500"} border-1 border border-custom-gray shadow-custom p-2 pr-4 bg-custom-gradient`}>
                                    <GoDotFill/>
                                    <span
                                        className="text-white text-sm capitalize">{dayjs().isAfter(dayjs(listing.expiry)) ? "Expired" : "Active"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-5 flex items-center justify-center">
                                <CancelListing listing={listing}/>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {address && selectedListings.length > 0 && <Button
                onClick={() => cancelSelectedListings(address, chainId)}
                disabled={selectedListings.length === 0 || loading}
                className="mt-4 pichi-button ml-auto flex justify-center"
            >
                {loading ? <Spinner size="sm" color="default"/> : null}
                Cancel Selected Listings
            </Button>}
        </div>
    );
};

export default ListingHistory;
