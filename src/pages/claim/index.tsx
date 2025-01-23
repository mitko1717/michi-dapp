import React, {useEffect} from "react";
import {LayoutWithAccount} from "../../components/layout/Layout";
import Hero from "../../claim/Hero";
import Stats from "../../claim/Stats";
import AdditionalDetails from "../../claim/AdditionalDetails";
import PointsEarned from "../../claim/PointsEarned";
import ClaimNow from "../../claim/ClaimNow";
import {fetchClaimDetails} from "../../features/claim/claimApi";
import {EvmAddress} from "../../types/address";
import {useAccount, useChainId, useSwitchChain} from "wagmi";
import {useRouter} from "next/router";
import {CLAIMFAIL} from "../../routes/routes";
import {ChainId} from "../../types/chain";

export type ClaimData = {
    index: number;
    address: string;
    amount: string;
    proof: string[];
    walletsOwned: number;
    points: { platform: string, points: string }[];
};

const Index = () => {
    const {address} = useAccount();
    const [data, setData] = React.useState<ClaimData>();
    const router = useRouter();
    const chainId = useChainId();
    const {switchChainAsync} = useSwitchChain();

    useEffect(() => {
        if (address) {
            fetchClaimDetails(address as EvmAddress).then((data) => {
                console.log(data);
                if (!data || data?.amount === "0") {
                    router.push(CLAIMFAIL);
                    console.log(data);
                }
                setData(data);
            });
        }
    }, [address]);

    useEffect(() => {
        if (chainId !== ChainId.ARBITRUM) {
            switchChainAsync({chainId: ChainId.ARBITRUM});
        }
    }, []);

    return (
        <LayoutWithAccount>
                <Hero/>
            {chainId !== ChainId.ARBITRUM ?
                <div className="max-w-screen-md text-center m-auto">
                    <h3> Switching to Arbitrum...</h3>
                </div>
                : <>
                    <div className="border-1 border-border-color max-w-screen-lg m-auto"/>
                    {data && <Stats walletsOwned={data?.walletsOwned}/>}
                    {data?.points && <PointsEarned points={data?.points}/>}
                    {data && <ClaimNow data={data}/>}
                    <div className="border-1 border-border-color max-w-screen-lg m-auto"/>
                <AdditionalDetails/>
                </>}
        </LayoutWithAccount>
    );
};

export default Index;
