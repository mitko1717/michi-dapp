import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {useAccount, useChainId} from "wagmi";
import {getUserSentOffers} from "../../features/user/userSlice";
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
import {Order} from "../../types/order";
import dayjs from "dayjs";
import {GoDotFill} from "react-icons/go";
import {chainIdToHex} from "../../utils/formatters";
import WalletPrice from "../misc/WalletPrice";
import CancelListing from "../marketplace/CancelListing";
import {useCancelListings} from "../../hooks/cancelListings";

const SentOffers = ({showScrollbar = true}) => {
    const user = useSelector((state: AppState) => state.user);
    const dispatch = useDispatch();
    const {address} = useAccount();
    const chainId = useChainId();
    const {selectedListings, toggleListingSelection, cancelSelectedListings, loading} = useCancelListings();

    useEffect(() => {
        if (address) {
            const _chainId = chainIdToHex(chainId);
            dispatch(getUserSentOffers({participant: address, chainId: _chainId}));
        }
    }, [address, chainId]);

    if (user?.sentOffersStatus === "loading") {
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

    if (!user?.sentOffers || user?.sentOffers?.length === 0) {
        return <div className="pichi-card">
            <p className="text-center text-lg my-12">No sent offers</p>
        </div>;
    }

    return (
        <div>
            <Table removeWrapper aria-label="Sent Offers"
                   className={`text-white border-1.5 border-solid border-custom-gray shadow-custom-alt bg-custom-gradient-alt rounded-2xl overflow-x-auto  ${showScrollbar ? "max-h-96 overflow-y-auto scrollbar-thin" : "overflow-y-hidden"}`}
            >
                <TableHeader>
                    <TableColumn className="bg-transparent py-5">Select</TableColumn>
                    <TableColumn className="bg-transparent px-6 py-5">Time</TableColumn>
                    <TableColumn className="bg-transparent py-5">Offered Price</TableColumn>
                    <TableColumn className="bg-transparent py-5">Status</TableColumn>
                    <TableColumn className="bg-transparent py-5"> </TableColumn>
                </TableHeader>
                <TableBody className="">
                    {user.sentOffers?.map((listing: Order, index: number) =>
                        <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                            <TableCell className="">
                                <Checkbox
                                    isSelected={selectedListings.includes(String(listing.nonce))}
                                    onValueChange={() => toggleListingSelection(String(listing.nonce))}
                                    classNames={{
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
                Cancel Selected Bids
            </Button>}
        </div>
    );
};

export default SentOffers;
