import React from "react";
import CreateNewWallet from "../widgets/CreateNewWallet";
import WalletList from "./walletList";

const WalletSidebar = () => {
    return (
        <div className="col-span-6 lg:col-span-2 2xl:col-span-1 border-y-0  2xl:col-span-1 bg-custom-gradient border-2 border-custom-gray lg:border-t-0 shadow-custom py-6 overflow-auto overflow-x-hidden height-full block">
            <div className="block px-6">
                <p>Pichi wallets are represented as NFTs. Deposit supported tokens into these wallets to earn
                    points.</p>
                <CreateNewWallet/>
            </div>
            <span className="block mt-10 mb-6 px-6 text-xl font-semibold hidden lg:block">My Wallets</span>
            <div className="border-t-1 border-b-1 border-custom-gray max-h-1/2 overflow-auto h-fit hidden lg:block">
                <WalletList/>
            </div>
        </div>
    );
};

export default WalletSidebar;