import React from "react";
import Placeholder from "../layout/Placeholder";
import CreateNewWallet from "../widgets/CreateNewWallet";

const NullWalletsPlaceholder = () =>
    <div className="full-page-placeholder">
        <Placeholder img="/assets/misc/wallet.png" title="Create a Pichi Wallet" action={<CreateNewWallet/>}
                     description="Pichi wallets are represented as NFTs. Deposit supported tokens into these wallets to earn points."/>
    </div>;

export default NullWalletsPlaceholder;
