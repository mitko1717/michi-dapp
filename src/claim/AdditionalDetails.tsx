import React from "react";

const Hero = () => {
    return (
        <div className="py-24 px-5 max-w-screen-xl m-auto">
            <p className="block text-4xl font-semibold mb-16 max-w-screen-sm m-auto text-center">Here are the ways to
                support our platform in the future</p>
            <div className="grid grid-cols-3 gap-4 text-left">
                <div className="pichi-card-empty p-6 flex flex-col w-full col-span-3 sm:col-span-1">
                    <span className="text-lg font-bold mb-1">Earn points through Pichi Wallets</span>
                    <span className="text-white-70">Deposit points-earning tokens or connect to other dapps to accrue points.</span>
                </div>
                <div className="pichi-card-empty p-6 flex flex-col w-full col-span-3 sm:col-span-1">
                    <span className="text-lg font-bold mb-1">Trade points</span>
                    <span className="text-white-70">Use the Pichi Marketplace to buy and sell points.</span>
                </div>
                <div className="pichi-card-empty p-6 flex flex-col w-full col-span-3 sm:col-span-1">
                    <span className="text-lg font-bold mb-1">Stake $PCH</span>
                    <span className="text-white-70">Stake your $PCH through our staking dashboard (coming soon)</span>
                </div>
            </div>
        </div>
    );
};

export default Hero;
