import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useAccount} from "wagmi";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/table";
import {
    getReferralHistory,
    getReferralLink,
    selectReferral,
    selectReferralHistory,
    selectReferralStatus
} from "../../features/referrals/referralsSlice";
import {Address} from "@ethereumjs/util";
import {Snippet, Spinner} from "@nextui-org/react";
import {formatAddress, formatBalance} from "../../utils/formatters";
import {track} from "@vercel/analytics";

const Referral = () => {
    const dispatch = useDispatch();
    const referralHistory = useSelector(selectReferralHistory);
    const {numReferrals, referralPoints, referralLink} = useSelector(selectReferral);
    const status = useSelector(selectReferralStatus);
    const {address} = useAccount();

    useEffect(() => {
        if (status === "idle" && referralHistory.length === 0) {
            if (address) {
                const walletAddress = address as unknown as Address;
                dispatch(getReferralHistory(walletAddress));
                dispatch(getReferralLink(walletAddress));
            }

        }
    }, [address]);

    if (status === "loading") {
        return <Spinner color="default"/>;
    }

    if (status === "failed") {
        return <div>Error loading referrals.</div>;
    }


    function formattedReferralUrl() {
        return referralLink.substring(0, 19) + "..." + referralLink.substring(referralLink.length - 4);
    }

    return (
        <div className="leaderboard-referral-container">
            <div className="leaderboard-referral-header">
                <h1 className="text-sm mb-2.5 sm:text-lg">Refer new users to earn more points</h1>
            </div>
            <div className="leaderboard-referral-history-row border-b-solid"></div>
            <div className="leaderboard-referral-image-container">
                <div className="relative mt-4 pt-4 px-6 rounded-lg h-28" style={{
                    backgroundImage: "url(/assets/leaderboard/referral.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "bottom"
                }}>
                    <div className="relative z-10">
                        <p className="leaderboard-referral-image-description">Refer someone to <br/> Pichi and get 10%
                            of <br/> their
                            points.</p>
                    </div>
                    <div className="absolute top-2 -right-1 transform translate-x-1/8 -translate-y-1/4">
                        <img src="/assets/leaderboard/rocket.png" alt="Rocket" className="w-32 h-32 sm:w-40 sm:h-40"/>
                    </div>
                </div>
                <Rank points={referralPoints} rank={numReferrals} pointsLabel="Referral Points"
                      rankLabel="Users Referred" isSmall={true}/>
                <div
                    className="leaderboard-share-container">
                    <Snippet
                        hideSymbol={true}
                        copyIcon={<span className="text-xs" onClick={() => track("Referral Copied")}>Share</span>}
                        // @ts-ignore
                        color="custom-gradient"
                        classNames={{
                            copyButton: "leaderboard-share-button"
                        }}
                        codeString={referralLink}
                    >
                        <p className="text-xs pr-1 lg:pr-8">{formattedReferralUrl()}</p>
                    </Snippet>
                </div>
                <div
                    className="pichi-card">
                    <p className="py-3 px-4 sm:px-6">Referral History</p>
                    {referralHistory.length === 0 ?
                        <div className="m-6"><p className="font-bold text-lg">No users referred so far.</p></div> :
                        <Table removeWrapper
                               className="leaderboard-referral-history-table">
                            <TableHeader className="border-b">
                                <TableColumn
                                    className="leaderboard-referral-table-column border-y-solid">Address</TableColumn>
                            </TableHeader>
                            <TableBody className=" ">
                                {referralHistory.map((user, index) => (
                                    <TableRow key={index}
                                              className={`${index !== referralHistory.length - 1 ? "leaderboard-referral-history-row border-b-solid" : ""}`}>
                                        <TableCell
                                            className="leaderboard-referral-address-cell">{formatAddress(user.address, 11, -11)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>}
                </div>
            </div>
        </div>
    );
};

interface RankProps {
    pointsLabel: string;
    rankLabel: string;
    isSmall: boolean;
    points: string | number;
    rank: string | number;
}

const Rank: React.FC<RankProps> = ({pointsLabel, rankLabel, isSmall, points, rank}) => {
    return (
        <div className={`my-4 rounded-lg overflow-hidden ${isSmall ? "text-sm" : ""}`}>
            <div className="grid grid-cols-2 gap-3 ">
                <div
                    className={`p-4 leaderboard-referral-points-container items-left ${isSmall ? "p-2" : "p-4"}`}>
                <span
                    className={`leaderboard-referral-point-input ${isSmall ? "text-xl" : "text-4xl"}`}>{formatBalance(points) || "-"}</span>
                    <span className={`text-white ${isSmall ? "text-xs" : "text-sm"}`}>{pointsLabel}</span>
                </div>
                <div
                    className={`text-gray-300 leaderboard-referral-points-container items-left ${isSmall ? "p-2" : "p-4"}`}>
            <span
                className={`leaderboard-referral-point-input ${isSmall ? "text-xl" : "text-4xl"}`}>{formatBalance(rank)}</span>
                    <span className={`text-white ${isSmall ? "text-xs" : "text-sm"}`}>{rankLabel}</span>
                </div>
            </div>
        </div>
    );
};


export default Referral;
