import React from "react";
import {LayoutWithAccount} from "../components/layout/Layout";

const Blocked = () => {
    return (
        <LayoutWithAccount>
            <div className="py-24 px-5 tokens-claim mt-24">
                <div className="flex flex-col items-center justify-center p-16 img-container ">
                    <div
                        className="bg-custom-gradient-alt shadow-custom-alt border-5 border-border-color p-6 rounded-full">
                        <img src="/logo.png" alt="Logo"/>
                    </div>
                </div>
                <p className="m-auto block text-4xl font-semibold max-w-screen-sm text-center mt-8">
                    Sorry! Your location is ineligible to claim the airdrop.</p>
            </div>
        </LayoutWithAccount>
    );
};

export default Blocked;
