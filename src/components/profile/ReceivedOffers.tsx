import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {useAccount, useChainId} from "wagmi";
import {getUserReceivedOffers} from "../../features/user/userSlice";
import {Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {Order} from "../../types/order";
import dayjs from "dayjs";
import {GoDotFill} from "react-icons/go";
import {chainIdToHex} from "../../utils/formatters";
import WalletPrice from "../misc/WalletPrice";
import OrderAction from "../marketplace/OrderAction";

const ReceivedOffers = ({showScrollbar = true}) => {
    const user = useSelector((state: AppState) => state.user);
    const dispatch = useDispatch();
    const {address} = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        if (address) {
            const _chainId = chainIdToHex(chainId);
            dispatch(getUserReceivedOffers({participant: address, chainId: _chainId}));
        }
    }, [address, chainId]);

    if (user?.receivedOffersStatus === "loading") {
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

    if (!user?.receivedOffers || user?.receivedOffers?.length === 0) {
        return <div className="pichi-card">
            <p className="text-center text-lg my-12">No received offers</p>
        </div>;
    }

    return (
        <div>
            <Table removeWrapper aria-label="Received Offers"
                   className={`text-white border-1.5 border-solid border-custom-gray shadow-custom-alt bg-custom-gradient-alt rounded-2xl overflow-x-auto  ${showScrollbar ? "max-h-96 overflow-y-auto scrollbar-thin" : "overflow-y-hidden"}`}
            >
                <TableHeader>
                    <TableColumn className="bg-transparent px-6 py-5">Time</TableColumn>
                    <TableColumn className="bg-transparent py-5">Offered Price</TableColumn>
                    <TableColumn className="bg-transparent py-5">Status</TableColumn>
                    <TableColumn className="bg-transparent py-5"> </TableColumn>
                </TableHeader>
                <TableBody className="">
                    {user.receivedOffers?.map((listing: Order, index: number) =>
                        <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
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
                            <TableCell className="py-5 flex justify-center"><OrderAction listing={listing} mode={"acceptOffer"}/></TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ReceivedOffers;
