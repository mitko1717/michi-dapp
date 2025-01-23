import React, {useEffect} from "react";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Button, Spinner} from "@nextui-org/react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import Moment from "react-moment";
import {useAccount, useReadContract, useWriteContract} from "wagmi";
import {StakingAbi, StakingContractAddress, StakingLPAbi, StakingLPAddress} from "../../config/staking.config";
import {formatEther, parseEther} from "viem";
import {Token} from "../../types/token";
import {stakingTokens} from "./Stake";
import {formatBalance, weiToEth} from "../../utils/formatters";
import {WalletClientError} from "../../types/errors";
import {toast} from "sonner";

const Portfolio = () => {
    const {address} = useAccount();
    const {writeContractAsync, isPending, data: generationData} = useWriteContract();
    const [loading, setLoading] = React.useState(false);

    const {data: stakingCooldown} = useReadContract({
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getCooldownEnd",
        args: [
            address
        ]
    });

    const {data: balance} = useReadContract({
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getAmountStaked",
        args: [
            address
        ]
    });

    const {data: balance2} = useReadContract({
        address: StakingLPAddress,
        abi: StakingLPAbi,
        functionName: "userToPoolInfo",
        args: [
            0,
            address
        ]
    });

    const {data: pendingRewards} = useReadContract({
        address: StakingLPAddress,
        abi: StakingLPAbi,
        functionName: "pendingRewards",
        args: [
            address,
            0
        ]
    });

    const harvest = async () => {
        try {
            setLoading(true);
            await writeContractAsync({
                abi: StakingLPAbi,
                address: StakingLPAddress,
                functionName: "harvest",
                args: [
                    0
                ]
            });
            toast.success("Harvested successfully");
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-4xl font-semibold p-4">Portfolio</h2>
            {balance || balance2 ? <Table removeWrapper aria-label="Tokenized Points"
                                          className={`text-white overflow-y-auto scrollbar-thin`}
            >
                <TableHeader className="bg-custom-gradient">
                    <TableColumn className="bg-transparent px-6 py-5 font-semibold text-white text-md">Staked
                        Amount</TableColumn>
                    <TableColumn className="bg-transparent px-6 py-5 pl-0 font-semibold text-white text-md">
                        {balance ? "Unlock on" : "Claimable Rewards"}
                    </TableColumn>
                    <TableColumn>&nbsp;</TableColumn>
                </TableHeader>
                <TableBody className="">
                    {balance && <TableRow className="border-t-1 border-solid border-custom-gray">
                        <TableCell className="px-6 py-5 flex items-center font-medium text-lg">
                                <span
                                    className="w-10 h-10 rounded-full mr-2 flex justify-center items-center icon-custom icon-container">
                                    <img src="/logo.png" alt="Chain Logo" className="h-1/2"/>
                                </span>
                            {balance ? Number(formatEther(balance as bigint)).toFixed(2) : "0"} PCH
                        </TableCell>
                        <TableCell className="py-5 px-0">
                            <div className="flex flex-col">
                                <Moment format="DD MMMM YYYY"
                                        className="text-md font-medium">{Number(String(stakingCooldown)) * 1000}</Moment>
                                <Moment format="HH:mm"
                                        className="text-white-70">{Number(String(stakingCooldown)) * 1000}</Moment>
                            </div>
                        </TableCell>
                        <TableCell>&nbsp;</TableCell>
                    </TableRow>}
                    {balance2 && <TableRow className="border-t-1 border-solid border-custom-gray">
                        <TableCell className="px-6 py-5 flex items-center font-medium text-lg">
                            {balance2 ? Number(formatEther(balance2[0] as bigint)).toFixed(2) : "0"} PCH/mETH LP
                        </TableCell>
                        <TableCell className="px-0">
                            <div className="flex items-center">
                                <span
                                    className="text-lg font-semibold">{formatBalance(formatEther(pendingRewards))}</span>

                            </div>
                        </TableCell>
                        <TableCell> {pendingRewards ?
                            <Button className="pichi-button w-auto font-semibold mx-2"
                                    onClick={() => harvest()}>  {loading &&
                                <Spinner color="default" size={"sm"}/>}Harvest
                            </Button> : <span>&nbsp;</span>}</TableCell>
                    </TableRow>}
                </TableBody>
            </Table> : <p className="text-lg text-white-70 font-medium px-6 text-center">No tokens staked</p>}
        </div>
    );
};

const PortfolioItem = ({token}: { token: Token }) => {
    const {address} = useAccount();

    const {data: stakingCooldown} = useReadContract({
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getCooldownEnd",
        args: [
            address
        ]
    });

    const {data: balance} = useReadContract({
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getAmountStaked",
        args: [
            address
        ]
    });

    return (<>
        <TableCell className="px-6 py-5 flex items-center font-medium text-lg">
                                <span
                                    className="w-10 h-10 rounded-full mr-2 flex justify-center items-center icon-custom icon-container">
                                    <img src="/logo.png" alt="Chain Logo" className="h-1/2"/>
                                </span>
            {balance ? formatEther(balance as bigint) : "0"}
        </TableCell>
        <TableCell className="py-5">
            <div className="flex flex-col">
                <Moment format="DD MMMM YYYY"
                        className="text-md font-medium">{Number(String(stakingCooldown)) * 1000}</Moment>
                <Moment format="HH:mm"
                        className="text-white-70">{Number(String(stakingCooldown)) * 1000}</Moment>
            </div>
        </TableCell>
    </>);
};

export default Portfolio;
