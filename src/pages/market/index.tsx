import React from "react";
import {LayoutWithAccount} from "../../components/layout/Layout";
import Hero from "../../components/marketplace/Hero";
import Explore from "../../components/marketplace/Explore";
import {Spacer} from "@nextui-org/react";
import ComingSoon from "../../components/placeholders/Coming Soon";
import {useChainId} from "wagmi";
import {ChainId} from "../../types/chain";

const Index = () => {
    const chainId = useChainId();
    // if (true) {
    //     return (
    //         <LayoutWithAccount>
    //             <div className="full-page-placeholder">
    //                 <Placeholder img="/assets/misc/wallet.png" title="Register for early access"
    //                              description="Our marketplace is almost finished. Fill out this form to be the first to use it!"
    //                              action={<a href="https://urvzwkqgnlm.typeform.com/to/vrTQTXuY" target="_blank"
    //                                         rel="noopener noreferrer" className="text-secondary font-bold text-xl">Form -&gt;</a>}/>
    //             </div>
    //         </LayoutWithAccount>
    //     );
    // }

    return (
        <LayoutWithAccount>
            <div className="w-full max-w-7xl mx-auto">
                {/*<BetaIzation/>*/}
                {chainId === ChainId.MANTLE ? <ComingSoon/> :
                    <>
                        <Hero/>
                        <Explore/>
                        <Spacer y={20}/>
                    </>
                }
            </div>
        </LayoutWithAccount>
    );
};

export default Index;
