import React from "react";
import Placeholder from "../layout/Placeholder";

const WalletNotSelectedPlaceholder = () =>
    <div className="full-page-placeholder">
        <Placeholder img="/assets/misc/wallet.png" title="Select a wallet"
                     description="Please select a Pichi Wallet from the list of wallets to view more details."/>
    </div>;

export default WalletNotSelectedPlaceholder;
