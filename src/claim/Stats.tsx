import React from "react";

interface StatsProps {
    walletsOwned: number;
}

const Stats: React.FC<StatsProps> = ({walletsOwned}) => {
    return (
        <div className="relative overflow-x-hidden">
            <img src="/logo-large.svg" alt="Logo" className="stats-logo"/>
            <div className="py-24 px-5 max-w-screen-md m-auto text-center">
            <p className="block text-4xl font-semibold mb-10">Let’s take a look at your Pichi journey up until now</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="placeholder w-full col-span-2 sm:col-span-2">
                    <span className="text-7xl">{walletsOwned}</span>
                    <span className="text-white-70">Wallets Owned</span>
                </div>
                {/*<div className="placeholder w-full col-span-2 sm:col-span-1">*/}
                {/*    <span className="text-7xl">144</span>*/}
                {/*    <span className="text-white-70">Deposits completed</span>*/}
                {/*</div>*/}
            </div>
        </div>
        </div>
    );
};

export default Stats;
