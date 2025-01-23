import {Provider} from "react-redux";
import type {AppProps} from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import store from "../store";
import {WagmiProvider} from "wagmi";
import {WagmiConfig} from "../config/wagmi.config";
import {NextUIProvider} from "@nextui-org/react";
import {Analytics} from "@vercel/analytics/react";
import "../styles/globals.scss";
import axios from "axios";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {darkTheme, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import Seo from "../components/layout/Seo";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NEXT_PUBLIC_HOST;
const queryClient = new QueryClient();

export default function app({Component, pageProps}: AppProps) {
    return (
        <WagmiProvider config={WagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    <UI Component={Component} pageProps={pageProps}/>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

function UI({Component,}: any) {
    return (
        <Provider store={store}>
            <NextUIProvider>
                <Seo title="Pichi Finance" url="https://app.michiwallet.com" logo="/logo.png"
                     description="Buy and sell points from pre-token projects"
                     keywords={[
                         "defi", "web3", "nft",
                         "erc", "erc6551",
                         "pichi", "pichiprotocol", "pichiwallet",
                         "eigenlayer", "renzo", "points", "restaking"
                     ]}
                     author="Pichi Finance"
                     twitterUsername="MichiProtocol"/>
                <Component/>
                <Analytics/>
            </NextUIProvider>
        </Provider>
    );
}