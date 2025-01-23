import React, {useEffect} from "react";
import {useRouter} from "next/router";
import {Snippet, Spinner} from "@nextui-org/react";
import WalletSidebar from "../../components/wallet/walletSidebar";
import WalletPointsBreakdown from "../../components/points/walletPointsBreakdown";
import WalletBalanceTable from "../../components/wallet/walletBalanceTable";
import {Deposit} from "../../components/tokens/Deposit";
import AdditionalWalletActions from "../../components/wallet/additionalWalletActions";
import RecentTransactions from "../../components/wallet/RecentTransactions";
import {Withdraw} from "../../components/tokens/Withdraw";
import NullWalletsPlaceholder from "../../components/placeholders/NullWalletsPlaceholder";
import {getExplorerLink} from "../../utils/helpers";
import {PiUploadSimple} from "react-icons/pi";
import {useChainId, useConfig} from "wagmi";
import {watchAccount} from "@wagmi/core";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import WalletSelector from "../../components/widgets/WalletSelector";
import {LayoutWithAccount} from "../../components/layout/Layout";
import Sell from "../../components/tokens/Sell";
import {EvmAddress} from "../../types/address";
import {useWalletData} from "../../hooks/currentWallet";
import WalletPrice from "../../components/misc/WalletPrice";
import {ChainId} from "../../types/chain";

const MichiWallet = () => {
    const router = useRouter();
    const {nid} = router.query;
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const {loading} = useWalletData(nid as unknown as EvmAddress);

    const config = useConfig();
    useEffect(() => {
        const unwatch = watchAccount(config, {
            onChange: (
                account,
                prevAccount,
            ) => {
                if (prevAccount.address !== account.address) {
                    router.push(`/wallets`);
                }
            },
        });
        return () => unwatch();
    }, []);

    const chainId = useChainId();

    return (
        <LayoutWithAccount>
            <div className="grid grid-cols-6">
                <WalletSidebar/>
                <WalletSelector/>
                {loading ?
                    <div className="col-span-6 lg:col-span-4 2xl:col-span-5 p-6 ">
                        <Spinner color="default" size={"lg"}/></div> :
                    currentWallet?.chainId ?
                        <div className="col-span-6 lg:col-span-4 2xl:col-span-5 height-full overflow-auto p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl">Pichi Wallet NFT # {currentWallet?.nftIndex}</h1>
                                    {currentWallet?.listings && currentWallet?.listings?.length > 0 &&
                                        <div className="flex items-center"><strong>Current Price:</strong> &nbsp;
                                            <WalletPrice wallet={currentWallet}/></div>}
                                </div>
                                <Sell/>
                            </div>
                            <Snippet symbol={
                                <div className="snippet-icon mt-2">
                                    <a href={getExplorerLink(chainId, currentWallet?.walletAddress)} target="_blank"
                                       rel="noreferrer noopener">
                                        <PiUploadSimple/>
                                    </a>
                                </div>
                            } variant="bordered">
                    <span className="inline-block overflow-ellipsis overflow-hidden max-w-36 sm:max-w-full -mb-1.5">
                    {currentWallet?.walletAddress as unknown as String}
                        </span>
                            </Snippet>
                            <div className="my-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl my-4">Token Balances</h2>
                                    <div className="flex">
                                        <Withdraw wallet={currentWallet} className="mr-2"/>
                                        <Deposit wallet={currentWallet}/>
                                    </div>
                                </div>
                                <WalletBalanceTable/>
                            </div>
                            <div className="my-8">
                                <h2 className="text-xl mb-6">Points Earned</h2>
                                <WalletPointsBreakdown/>
                            </div>
                            <div className="my-4">
                                <h2 className="text-xl my-4">Additional Wallet Actions</h2>
                                <AdditionalWalletActions wallet={currentWallet}/>
                            </div>
                            {currentWallet?.chainId != ChainId.MANTLE &&
                                <div className="my-6">
                                    <h2 className="text-xl my-4">Recent Transactions From This Wallet</h2>
                                    <RecentTransactions wallet={currentWallet}/>
                                </div>
                            }
                        </div> : <NullWalletsPlaceholder/>}
            </div>
        </LayoutWithAccount>
    );
};

export default MichiWallet;