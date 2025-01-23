import React from "react";
import DeployOnOtherChain from "../widgets/DeployOnOtherChain";
import {Wallet} from "../../types/wallet";
import ClaimInterestFromPendle from "../widgets/ClaimInterestFromPendle";
import ConnectWallet from "../widgets/ConnectWallet";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import ClaimEtherfi from "../widgets/ClaimEtherfi";
import {useChainId} from "wagmi";
import {ChainId} from "../../types/chain";

type Props = {
    wallet: Wallet
}
const AdditionalWalletActions: React.FC<Props> = ({wallet}) => {
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);

    return (
        <div className="grid grid-cols-4 gap-2">
            {currentWallet && <div className="col-span-4 sm:col-span-1">
                <div className="pichi-card p-6 h-full">
                    <div className="flex flex-col justify-between h-full">
                        <div className="flex justify-between mb-6">
                            <span className="text-xl font-semibold max-w-64">Connect wallet to other dapps</span>
                            <img src="/assets/logos/walletConnect.jpg" alt="Pendle Logo" className="h-12 rounded-full"/>
                        </div>
                        <ConnectWallet wallet={currentWallet}/>
                    </div>
                </div>
            </div>}
            <div className="col-span-4 sm:col-span-1">
                <ClaimInterestFromPendle wallet={wallet}/>
            </div>
            <DeployOnOtherChain wallet={wallet}/>
            {currentWallet?.chainId != ChainId.MANTLE && <ClaimEtherfi wallet={wallet}/>}
        </div>
    );
};

export default AdditionalWalletActions;
