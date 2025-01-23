import React, {useEffect} from "react";
import {Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import dayjs from "dayjs";
import {GoDotFill} from "react-icons/go";
import {Order} from "../../types/order";
import {tableTimeFormatter} from "../../utils/formatters";
import WalletPrice from "../misc/WalletPrice";

const CurrentOffers = ({ showScrollbar = true }) => {
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);

    if (currentWallet?.offerStatus === "loading") {
        return (
            <div className="pichi-card">
                <div className="text-center text-lg my-12">
                    <Spinner color="default" size={"lg"} />
                </div>
            </div>
        );
    }

    if (!currentWallet?.offers || currentWallet?.offers?.length === 0) {
        return (
            <div className="pichi-card">
                <p className="text-center text-lg my-12">No offers yet</p>
            </div>
        );
    }

    return (
        <Table
            removeWrapper
            aria-label="Current Offers"
            className={`text-white border-1.5 border-solid border-custom-gray shadow-custom-alt bg-custom-gradient-alt rounded-2xl overflow-x-auto ${
                showScrollbar ? "max-h-96 overflow-y-auto scrollbar-thin" : "overflow-y-hidden"
            }`}
        >
            <TableHeader>
                <TableColumn className="bg-transparent px-6 py-5">Time</TableColumn>
                <TableColumn className="bg-transparent py-5">Offered Price</TableColumn>
                <TableColumn className="bg-transparent py-5">Status</TableColumn>
                <TableColumn className="bg-transparent py-5">Bidder</TableColumn>
            </TableHeader>
            <TableBody>
                {currentWallet.offers?.map((listing: Order, index: number) => (
                    <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                        <TableCell className="px-6 py-5">{tableTimeFormatter(listing.date)}</TableCell>
                        <TableCell className="py-5"><WalletPrice order={listing}/></TableCell>
                        <TableCell className="justify-center">
                            <div
                                className={`inline-flex items-end text-lg ${
                                    dayjs().isAfter(dayjs(listing.expiry)) ? "text-red-600" : "text-green-500"
                                } border-1 border-custom-gray shadow-custom p-2 pr-4 bg-custom-gradient`}
                            >
                                <GoDotFill />
                                <span className="text-white text-sm capitalize">
                                    {dayjs().isAfter(dayjs(listing.expiry)) ? "Expired" : "Active"}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="py-5">{listing.participant}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default CurrentOffers;
