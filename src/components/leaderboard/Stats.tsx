import React, {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    getLeaderboardPoints,
    selectLeaderboard,
    selectPointsStatus,
    selectOffset
} from "../../features/points/pointsSlice";
import {useAccount} from "wagmi";
import Rank from "./Rank";
import {Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {selectUser} from "../../features/user/userSlice";
import {formatAddress, formatBalance} from "../../utils/formatters";
import {LeaderboardUser} from "../../types/leaderboard";

const Stats = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const rowsPerPage = 7;

    const leaderboard = useSelector(selectLeaderboard);
    const status = useSelector(selectPointsStatus);
    const offset = useSelector(selectOffset);
    let {points, rank} = useSelector(selectUser);
    const {address} = useAccount();

    useEffect(() => {
        if (offset === 0) {
            dispatch(getLeaderboardPoints(offset));
        }
    }, [dispatch, offset]);

    const pages = useMemo(() => {
        return leaderboard?.length ? Math.ceil(leaderboard.length / rowsPerPage) : 0;
    }, [leaderboard?.length, rowsPerPage]);

    const paginatedLeaderboard = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return leaderboard.slice(start, end);
    }, [leaderboard, page, rowsPerPage]);

    const handlePageChange = (page: React.SetStateAction<number>) => {
        setPage(page);
        if (page === pages) {
            const newOffset = leaderboard.length;
            dispatch(getLeaderboardPoints(newOffset));
        }
    };

    if (status === "loading") {
        return <Spinner color="default"/>;
    }

    if (status === "failed") {
        return <div>Error loading points.</div>;
    }

    if (status === "idle" && leaderboard.length === 0) {
        return <div>No leaderboard data available</div>;
    }

    const renderLeaderboardRows = (paginatedLeaderboard: LeaderboardUser[]) => {
        const initialRow = (<TableRow key={0}
                                      className="leaderboard-stats-row border-b-solid ">
            <TableCell className="leaderboard-stats-cell">{rank}</TableCell>
            <TableCell
                className="leaderboard-stats-cell">{address && formatAddress(address)}</TableCell>
            <TableCell
                className="leaderboard-stats-cell">{formatBalance(points)}</TableCell>
        </TableRow>)
        const leaderboardRows = paginatedLeaderboard.map((user, index) => (
            <TableRow key={index + 1} className="leaderboard-stats-row border-b-solid">
                <TableCell className="leaderboard-stats-cell">{user.position}</TableCell>
                <TableCell
                    className="leaderboard-stats-cell">{formatAddress(user.address)}</TableCell>
                <TableCell
                    className="leaderboard-stats-cell">{formatBalance(user.totalPoints)}</TableCell>
            </TableRow>
        ));
        return [initialRow, ...leaderboardRows];
    };

    return (
        <div
            className="leaderboard-stats-container">
            <div className="leaderboard-stats-header-container">
                <h1 className="leaderboard-stats-title">Stats</h1>
                <span
                    className="leaderboard-stats-header">
                    {address && formatAddress(address)}
                </span>
            </div>
            <div className="leaderboard-stats-row border-b-solid "></div>
            <div className="p-4 pt-1 sm:p-8 sm:pt-2 ">
                {rank && <Rank points={points} rank={rank} pointsLabel="My Points" rankLabel="Global Rank" isSmall={false}/>}
                <div className="leaderboard-table-container pichi-card">
                    <p className="py-3 px-4 sm:px-6">Leaderboard</p>
                    <Table
                        removeWrapper
                        className=" "
                        bottomContent={
                            pages > 0 ? (
                                <div className="flex w-full justify-center mb-4">
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
                            ) : null
                        }
                    >
                        <TableHeader className="border-b">
                            <TableColumn
                                className="leaderboard-stats-column border-y-solid 	">
                                Rank
                            </TableColumn>
                            <TableColumn
                                className="leaderboard-stats-column border-y-solid ">
                                Address
                            </TableColumn>
                            <TableColumn
                                className="leaderboard-stats-column border-y-solid  rounded-none">
                                Points
                            </TableColumn>
                        </TableHeader>
                        <TableBody items={paginatedLeaderboard} className="bg-custom-dark-blue">
                            {renderLeaderboardRows(paginatedLeaderboard)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Stats;
