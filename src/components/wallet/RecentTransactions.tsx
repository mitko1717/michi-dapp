import React, {useEffect, useMemo, useState} from "react";
import {
    Pagination,
    Spacer,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import {chainIdToHex, formatBalance} from "../../utils/formatters";
import {Wallet} from "../../types/wallet";
import axios from "axios";
import {PlatformApiResponse} from "../../types/platform";
import {useChainId} from "wagmi";
import {TransactionType} from "../../types/transaction";
import {getIconFromPlatform} from "../../utils/platform";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {getShortUrl} from "../../utils/helpers";

dayjs.extend(relativeTime);

const RecentTransactions: React.FC<{ wallet: Wallet }> = ({wallet}) => {

    const [data, setData] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = useState(1);
    const rowsPerPage = 7;
    const chainId = useChainId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/tokens/${chainIdToHex(chainId)}/${wallet.walletAddress}/transactions`);
                const _cleanData = response?.data?.filter((platform: PlatformApiResponse) => Number(platform?.points) !== 0);
                setData(_cleanData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [wallet.walletAddress]);

    const pages = useMemo(() => {
        return data?.length ? Math.ceil(data.length / rowsPerPage) : 0;
    }, [data?.length, rowsPerPage]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return data.slice(start, end);
    }, [data, page, rowsPerPage]);

    const handlePageChange = (page: React.SetStateAction<number>) => {
        setPage(page);
    };

    if(loading){
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

    if(!data || data.length === 0){
        return <div className="pichi-card">
            <p className="text-center text-lg my-12">No transactions found</p>
        </div>;
    }



    return (
        <div>
            <Table removeWrapper aria-label="Tokenized Points"
                   className="text-white border-1 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl overflow-hidden overflow-x-auto">
                <TableHeader>
                    <TableColumn className="bg-transparent px-6 pt-2">Time</TableColumn>
                    <TableColumn className="bg-transparent pt-2">Action</TableColumn>
                    <TableColumn className="bg-transparent pt-2">Position</TableColumn>
                    <TableColumn className="bg-transparent pt-2">Link</TableColumn>
                </TableHeader>
                <TableBody className="">
                    {paginatedData?.map((transaction: any, index: number) =>
                        <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                            <TableCell className="py-6 px-6"> {dayjs(transaction.timestamp).fromNow()}</TableCell>
                            <TableCell className="capitalize">{transaction?.transactionType}</TableCell>
                            <TableCell>
                                <div className="flex items-center h-full">
                                    <img src={getIconFromPlatform(transaction?.platform?.toLowerCase())}
                                         alt={transaction?.platform} className="mr-2"/>
                                    {transaction?.transactionType === TransactionType.WITHDRAW ? "-" : "+"}
                                    {formatBalance(transaction.amount)}
                                    <Spacer x={2}/>
                                    {transaction?.name}
                                    <Spacer x={2}/>
                                </div>
                            </TableCell>
                            <TableCell>
                                <a href={transaction?.link} target="_blank" rel="noopener noreferrer">
                                    {getShortUrl(transaction)}
                                </a>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {pages > 0 && (
                <div className="flex w-full justify-center my-4">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        radius="full"
                        page={page}
                        total={pages}
                        variant="light"
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default RecentTransactions;
