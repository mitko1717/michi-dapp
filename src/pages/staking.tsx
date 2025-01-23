import React, {useEffect} from "react";
import {LayoutWithAccount} from "../components/layout/Layout";
import {Button, ButtonGroup} from "@nextui-org/react";
import Stake from "../components/staking/Stake";
import Unstake from "../components/staking/Unstake";
import Portfolio from "../components/staking/Portfolio";
import {ChainId} from "../types/chain";
import {useChainId, useSwitchChain} from "wagmi";

const Staking = () => {
    const [stake, setStake] = React.useState(true);

    return (
        <LayoutWithAccount>
            <div className="max-w-screen-2xl m-auto mt-20 px-2">
                <h1 className="text-5xl font-semibold mb-6">Stake to Earn Rewards</h1>
                <p className="text-white-70 font-medium">Earn rewards every second by depositing PCH or LP tokens</p>
                <div className="grid grid-cols-4 gap-6">
                    <div className="mt-6 pichi-card-empty col-span-4 sm:col-span-2">
                        <ButtonGroup className="p-4 border-b-1 border-border-color w-full justify-start">
                            <Button
                                className={stake ? "pichi-button !rounded-r-none" : "pichi-button-empty !rounded-r-none"}
                                onClick={() => setStake(true)}>Stake</Button>
                            <Button
                                className={!stake ? "pichi-button !rounded-l-none" : "pichi-button-empty !rounded-l-none"}
                                onClick={() => setStake(false)}>Unstake</Button>
                        </ButtonGroup>
                        {
                            stake ? <Stake/> : <Unstake/>
                        }
                    </div>
                    <div className="mt-6 pichi-card-empty col-span-4 sm:col-span-2">
                        <Portfolio/>
                    </div>
                </div>
            </div>
        </LayoutWithAccount>
    );
};

export default Staking;
