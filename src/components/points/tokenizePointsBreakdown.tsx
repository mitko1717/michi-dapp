import React from "react";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {PlatformApiResponse} from "../../types/platform";
import {getIconFromPlatform} from "../../utils/platform";
import {formatBalance} from "../../utils/formatters";
import {FaArrowRightLong} from "react-icons/fa6";

const TokenizePointsBreakdown: React.FC<{ points: PlatformApiResponse[] }> = ({points}) => {
    return (
        <div>
            <Table removeWrapper aria-label="Tokenized Points"
                   className="text-white border-2 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl overflow-hidden">
                <TableHeader>
                    <TableColumn className="bg-transparent px-6 pt-2">You are converting</TableColumn>
                    <TableColumn className="bg-transparent px-6 pt-2"> </TableColumn>
                    <TableColumn className="bg-transparent px-6 pt-2">You will get</TableColumn>
                </TableHeader>
                <TableBody className="">
                    {points?.map((points, index) =>
                        <TableRow key={index} className="border-t-2 border-solid border-custom-gray">
                            <TableCell className="flex flex-row items-center  px-6 py-4">
                                <img src={getIconFromPlatform(points.platform)} alt="Logo"
                                     className="w-7 mr-2"/>{formatBalance(points.points)} {points.platform} Points
                            </TableCell>
                            <TableCell>{<FaArrowRightLong/>}</TableCell>
                            <TableCell>{formatBalance(points.points)} $m{points.platform}<br/>(Pichi {points.platform} Points)</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TokenizePointsBreakdown;
