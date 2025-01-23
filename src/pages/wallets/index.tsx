import type {NextPage} from "next";
import React from "react";
import Wallets from "../../components/wallet/wallets";
import {LayoutWithAccount} from "../../components/layout/Layout";

const IndexPage: NextPage = () => {

    return (
        <LayoutWithAccount>
            <Wallets/>
        </LayoutWithAccount>
    );
};

export default IndexPage;
