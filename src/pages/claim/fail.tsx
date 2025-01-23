import React from "react";
import {LayoutWithAccount} from "../../components/layout/Layout";
import Link from "next/link";
import {MARKET, WALLETS} from "../../routes/routes";
import {Button} from "@nextui-org/react";

const Fail = () => {
    return (
        <LayoutWithAccount>
            <div className="py-24 px-5 text-white-80">
                <p className="m-auto block text-2xl font-semibold max-w-screen-sm text-center">Sorry, no allocation to
                    claim. Unfortunately, you did not receive any $PCH at this time.</p>
            </div>
            <div className="border-1 border-border-color max-w-screen-lg m-auto"/>
            <div className="py-24 px-5 text-white-80 relative">
                <img src="/logo-large.svg" alt="Logo" className="stats-logo"/>
                <img src="/logo-large.svg" alt="Logo" className="failed-logo"/>
                <p className="m-auto block text-2xl font-semibold max-w-screen-sm text-center">Here are the ways to
                    interact with our platform to increase your chances of a future allocation.</p>
            </div>
            <div className="grid grid-cols-3 max-w-screen-lg m-auto gap-4">
                <div className="col-span-3 sm:col-span-1 pichi-card p-6 ">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-xl">Create a new Pichi Wallet</p>
                        <div><img src="/assets/misc/wallet.png" alt="Icon" className="w-16"/></div>
                    </div>
                    <Button className="w-full mt-6 pichi-button-empty flex" as={Link} href={WALLETS}>
                            Create
                        </Button>
                </div>
                <div className="col-span-3 sm:col-span-1 pichi-card p-6 ">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-xl">Deposit assets into your Pichi Wallet</p>
                        <div><img src="/assets/logos/usdc.png" alt="Icon" className="w-16"/></div>
                    </div>
                    <Button className="w-full mt-6 pichi-button-empty flex" as={Link} href={WALLETS}>
                        Deposit
                        </Button>
                </div>
                <div className="col-span-3 sm:col-span-1 pichi-card p-6 ">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-xl">Purchase points on our marketplace</p>
                        <div><img src="/logo.png" alt="Icon" className="w-16"/></div>
                    </div>
                    <Button className="w-full mt-6 pichi-button-empty flex" as={Link} href={MARKET}>
                        Buy Points
                        </Button>
                </div>
            </div>
            <div>
                <p className="text-center text-primary text-xl mt-12 font-semibold">More ways to earn points coming soon...</p>
            </div>
        </LayoutWithAccount>
    );
};

export default Fail;
