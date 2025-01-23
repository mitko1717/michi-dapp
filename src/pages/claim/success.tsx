import React from "react";
import {LayoutWithAccount} from "../../components/layout/Layout";

const Success = () => {
    return (
        <LayoutWithAccount>
            <div className="py-24 px-5 tokens-claim">
                <div className="flex flex-col items-center justify-center p-16 img-container ">
                    <div
                        className="bg-custom-gradient-alt shadow-custom-alt border-5 border-border-color p-6 rounded-full">
                        <img src="/logo.png" alt="Logo"/>
                    </div>
                </div>
                <p className="m-auto block text-5xl font-semibold max-w-screen-sm text-center">Claimed Successfully!</p>
                <p className="m-auto mt-7 block text-lg max-w-screen-sm text-center">
                    As a holder of Pichi, you’ll be able to make key decisions that shape the future of Pichi Finance.
                    <a href="" className="text-[#F5841F]" target="_blank" rel="noreferrer noopener"> Learn More</a>
                </p>
                {/*<div className="grid grid-cols-1 gap-2 mt-12">*/}
                {/*    <div className="placeholder w-full col-span-1">*/}
                {/*        <span className="text-7xl">24</span>*/}
                {/*        <span className="text-white-70">Claimed Successfully</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </LayoutWithAccount>
    );
};

export default Success;
