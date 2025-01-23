`use client`
import React, {useEffect, useState} from "react";
import Nav from "./Navbar";
import Header from "./Header";
import {useAccount, useChainId} from "wagmi";
import NotConnected from "../placeholders/NotConnected";
import {getApprovedTokens} from "../../features/tokens/tokensSlice";
import {useDispatch} from "react-redux";
import {getMichiWallets, getTokenBalance} from "../../features/wallet/walletSlice";
import {Address} from "@ethereumjs/util";
import {Toaster} from "sonner";
import {getBetaAuthorization, getTermsAccepted, getUserInfo} from "../../features/user/userSlice";
import Terms from "../user/Terms";
import {getOrders} from "../../features/marketplace/marketplaceSlice";
import {chainIdToHex} from "../../utils/formatters";
import {OrderType} from "../../features/orders/orderAPI";

interface Props {
    children?: React.ReactNode;
}



const positions = [
    { x: 10, y: 10 }, { x: 70, y: 120 }, { x: 90, y: 10 },
    { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 },
    { x: 10, y: 90 }, { x: 50, y: 90 }, { x: 90, y: 90 }
];

function generateGradient(index: number) {
    const pos = positions[index % positions.length];
    return `radial-gradient(circle at ${pos.x}% ${pos.y}vh, rgba(255, 168, 90, 0.098) 0%, rgba(255, 168, 90, 0) 38.02vh)`;
}

const Layout: React.FC<Props> = ({children}) => {
    const [hasMounted, setHasMounted] = useState(false);
    const [backgroundStyle, setBackgroundStyle] = useState('');

    const {address} = useAccount();
    const dispatch = useDispatch();
    const chainId = useChainId();

    useEffect(() => {
        if (address) {
            dispatch(getOrders({chainId: chainIdToHex(chainId), type: OrderType.Listing}));
        }
    }, [chainId, address]);

    useEffect(() => {
        if (address) {
            const walletAddress = address as unknown as Address;
            dispatch(getUserInfo(walletAddress));
            dispatch(getMichiWallets({chainId, walletAddress}));
            dispatch(getBetaAuthorization());
            dispatch(getTermsAccepted());
            dispatch(getApprovedTokens(chainId));
            dispatch(getTokenBalance({chainId, walletAddress}));
        }
    }, [chainId, address]);

    useEffect(() => {
        const gradients = [];
        for (let i = 0; i < 2; i++) {
            gradients.push(generateGradient(i));
        }
        setBackgroundStyle(gradients.join(', '));
    }, []);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }
    return (
        <main className="dark text-foreground min-h-screen" style={{ background: backgroundStyle, minHeight: '100vh' }}>
            <Header/>
            <Nav/>
            <Terms/>
            {children}
            <Toaster toastOptions={{
                className: "toasts-container",
            }}/>
        </main>
    );
};

export const LayoutWithAccount: React.FC<Props> = ({children}) => {
    const {address} = useAccount();

    return (
        <Layout>
            {address ? children : <NotConnected/>}
        </Layout>
    );
};

export default Layout;
