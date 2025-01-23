import React from "react";
import Stats from "../components/leaderboard/Stats";
import Referral from "../components/leaderboard/Referral";
import {LayoutWithAccount} from "../components/layout/Layout";


const Leaderboard = () => {
    return (
        <LayoutWithAccount>
            <div className="p-6 w-full max-w-5xl mx-auto mt-5">
                <div className="mb-6 sm:mb-8 ">
                    <h1 className="text-5xl font-medium text-leaderboard-title-gradient mb-6">Pichi Points</h1>
                    <p className="text-xs sm:text-sm leading-relaxed">
                        Pichi supports Yield Tokens from Pendle for deposits. Pendle YT allow you to earn <br/> points
                        at an accelerated rate while having no exposure to the underlying asset
                    </p>
                </div>
                <div className="grid grid-cols-1 w-full lg:grid-cols-5">
                    <div className="col-span-1 lg:col-span-3">
                        <Stats/>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <Referral/>
                    </div>
                </div>
            </div>
        </LayoutWithAccount>
    );
};


export default Leaderboard;
