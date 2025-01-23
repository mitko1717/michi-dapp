import React from "react";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {useAccount} from "wagmi";

const data = [{
    name: "mEigen",
    amount: 308284,
    share: "1.385",
    icon: "https://ethena.fi/shared/ethena.svg"
},
    {
        name: "mEigen",
        amount: 308285,
        share: "1.385",
        icon: "https://ethena.fi/shared/ethena.svg"
    },
    {
        name: "mEigen",
        amount: 308281,
        share: "1.385",
        icon: "https://ethena.fi/shared/ethena.svg"
    },
    {
        name: "mEigen",
        amount: 308284,
        share: "1.385",
        icon: "https://ethena.fi/shared/ethena.svg"
    }
];
const MyTokenizedPoints = () => {
    const {address} = useAccount();
    return (
        <div>
            <h2>My Points Tokens</h2>
            <Table removeWrapper aria-label="Tokenized Points"
                   className="border-2 border-solid border-custom-gray shadow-custom bg-custom-gradient my-4 rounded-2xl overflow-hidden">
                <TableHeader>
                    <TableColumn className="bg-transparent px-6 py-5">Token</TableColumn>
                    <TableColumn className="bg-transparent px-6 py-5">Amount</TableColumn>
                    <TableColumn className="bg-transparent px-6 py-5">% Share of protocol owned points</TableColumn>
                </TableHeader>
                <TableBody className="">
                    {data.map((token, index) =>
                        <TableRow key={index} className="border-t-2 border-solid border-custom-gray">
                            <TableCell className="flex flex-row items-center  px-6 py-4">
                                <img src={token.icon} alt="Logo" className="w-7 mr-2"/>{token.name}
                            </TableCell>
                            <TableCell>{token.amount}</TableCell>
                            <TableCell>{token.share}%</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default MyTokenizedPoints;
