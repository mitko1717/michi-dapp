import React from "react";
import Placeholder from "../layout/Placeholder";
import {ConnectButton} from "@rainbow-me/rainbowkit";

const NotConnected = () => {
    return (
        <div className="full-page-placeholder">
            <Placeholder img="/assets/misc/coins.png" title="Wallet Not Connected" action={<ConnectButton/>}
                         description="Please connect your web3 wallet to access this app."/>
        </div>
    );
};

export default NotConnected;
