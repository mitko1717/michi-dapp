import React from "react";
import {Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {getIconFromPlatform} from "../../utils/platform";
import {formatBalance} from "../../utils/formatters";
import {useSelector} from "react-redux";
import {AppState} from "../../store";

const WalletPointsBreakdown = ({ showScrollbar = false }) => {

    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);

    if (currentWallet?.pointsStatus === "loading") {
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

    if (!currentWallet?.points || currentWallet?.points?.length === 0) {
        return <div className="pichi-card">
            <p className="text-center text-lg my-12">No points found</p>
        </div>;
    }

    return (
        <div>
            <Table   removeWrapper aria-label="Tokenized Points"
                   className={`text-white border-1 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl  ${showScrollbar?'max-h-52 overflow-y-auto scrollbar-thin':'overflow-hidden'}`}
            >
                <TableHeader>
                    <TableColumn className="bg-transparent px-6 py-5">Platform</TableColumn>
                    <TableColumn className="bg-transparent py-5 cursor-pointer">Amount </TableColumn>
                </TableHeader>
                <TableBody className="">
                    {currentWallet?.points?.map((points, index) =>
                        <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                            <TableCell className="flex flex-row items-center  px-6 py-5">
                                <img src={getIconFromPlatform(points.platform)} alt="Logo" className="w-7 mr-2"/>{points.platform}
                            </TableCell>
                            <TableCell>{formatBalance(points.points)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default WalletPointsBreakdown;
