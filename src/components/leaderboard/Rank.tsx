import React, {useEffect} from "react";
import {formatBalance} from "../../utils/formatters";

type RankProps = {
    pointsLabel: string;
    rankLabel: string;
    isSmall?: boolean;  // Optional boolean
    points: number | string;  // Can be either number or string based on formatBalance return
    rank: number | string;  // Can be either number or string based on formatBalance return
};

const Rank: React.FC<RankProps> = ({ pointsLabel, rankLabel, isSmall = false, points, rank }) => {

    return (
        <div className={`leaderboard-rank ${isSmall ? "text-sm" : ""}`}>
            <div className="grid grid-cols-6 gap-3 ">
                <div
                    className={`col-span-3 p-4 items-left flex flex-col pichi-card ${isSmall ? "p-2" : "p-4"}`}>
                <span
                    className={`leaderboard-rank-value ${isSmall ? "text-xl" : "text-3xl"}`}>{formatBalance(points) || "-"}</span>
                    <span className={`text-white ${isSmall ? "text-xs" : "text-sm"}`}>{pointsLabel}</span>
                </div>
                <div
                    className={`col-span-3 text-gray-300 items-left flex flex-col pichi-card ${isSmall ? "p-2" : "p-4"}`}>
            <span
                className={`leaderboard-rank-value ${isSmall ? "text-xl" : "text-3xl"}`}>{formatBalance(rank) ? "#" : ""}{rank}</span>
                    <span className={`text-white ${isSmall ? "text-xs" : "text-sm"}`}>{rankLabel}</span>
                </div>
            </div>
        </div>
    );
}

export default Rank;
