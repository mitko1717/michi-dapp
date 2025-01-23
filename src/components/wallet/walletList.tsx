import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import Link from "next/link";
import {MICHI_WALLET} from "../../routes/routes";
import {FaChevronRight} from "react-icons/fa6";
import {usePathname} from "next/navigation";
import {Wallet} from "../../types/wallet";
import {getIconFromChain} from "../../utils/chain";
import {Input, Skeleton} from "@nextui-org/react";
import {getIconFromPlatform} from "../../utils/platform";
import {Point} from "../../types/point";
import {useChainId} from "wagmi";
import {ChainId} from "../../types/chain";
import {track} from "@vercel/analytics";
import CreateNewWallet from "../widgets/CreateNewWallet";

const WalletList = () => {
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);
    const status = useSelector((state: AppState) => state.wallet.status);
    const currentChainId = useChainId();
    const [sortedMichiWallets, setSortedMichiWallets] = useState<Wallet[]>([]);

    useEffect(() => {
        const sortedMichiWallets = [...(michiWallets || [])].sort((a, b) => {
            const order = [currentChainId, ChainId.ETHEREUM, ChainId.ARBITRUM, ChainId.OPTIMISM, ChainId.MANTLE, ChainId.SEPOLIA];
            const indexA = order.indexOf(a.chainId);
            const indexB = order.indexOf(b.chainId);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setSortedMichiWallets(sortedMichiWallets);
    }, [michiWallets, currentChainId]);


    if (status === "loading") return <div className="p-6">
        <_Skeleton/>
        <_Skeleton/>
        <_Skeleton/>
        <_Skeleton/>
    </div>;

    if (status === "failed") return <div className="p-6">
        <span className="gradient-text font-semibold text-2xl block">Error: fetching wallets failed</span>
        <img src="/assets/misc/wallet.png" alt="Wallet" className="block mt-6"/>
        <span className="mt-2 block">Please try again later!</span>
    </div>;

    const onSearch = (value: string) => {
        const sortedMichiWallets = [...(michiWallets || [])].sort((a, b) => {
            const order = [currentChainId, ChainId.ETHEREUM, ChainId.ARBITRUM, ChainId.OPTIMISM, ChainId.MANTLE, ChainId.SEPOLIA];
            const indexA = order.indexOf(a.chainId);
            const indexB = order.indexOf(b.chainId);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        setSortedMichiWallets(sortedMichiWallets.filter(wallet => {
            const isNftIndexMatch = wallet.nftIndex.toLowerCase().includes(value.toLowerCase());

            const isTokenMatch = wallet.tokens?.some(token => token.name.toLowerCase().includes(value.toLowerCase()));

            const isPlatformMatch = wallet.points?.some(point => point.platform.toLowerCase().includes(value.toLowerCase()));

            return isNftIndexMatch || isTokenMatch || isPlatformMatch;
        }));
    };
    return (
        <div>
            <div className="my-4 mx-4">
                <Input
                    className="input rounded-medium"
                    placeholder="Type a Pichi ID or token or platform..."
                    onChange={(e) => onSearch(e.target.value)}/>
            </div>
            {
                sortedMichiWallets?.length === 0 ? <div className="p-4 pt-6 pichi-card-empty m-4">
                    <span className="font-semibold text-2xl text-center block">No Pichi Wallets Owned</span>
                    <img src="/assets/misc/wallet.png" alt="Wallet" className="block m-auto my-5 w-1/2"/>
                    <p className="text-center text-sm mb-2">Pichi wallets are represented as NFTs. Deposit supported tokens into these wallets to earn
                        points.</p>
                    <CreateNewWallet/>
                </div> : <ul>
                    {sortedMichiWallets?.map((wallet, index) =>
                        <WalletListItem wallet={wallet} key={index}/>
                    )}
                </ul>
            }
        </div>
    );
};

const _Skeleton = () => {
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);
    const status = useSelector((state: AppState) => state.wallet.status);

    return (<Skeleton className="rounded-lg my-2" isLoaded={status !== "loading" && michiWallets?.length === 0}>
        <div className="h-12 rounded-lg bg-michi-purple"></div>
    </Skeleton>);
};


type Props = {
    wallet: Wallet
}

const WalletListItem: React.FC<Props> = ({wallet}) => {
    const [isSelected, setIsSelected] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsSelected(pathname === `${MICHI_WALLET}${wallet.walletAddress}`);
    }, [pathname]);

    const tokenCount = useMemo(() => {
        return wallet?.tokens?.filter(token => Number(token.balance) !== 0).length || 0;
    }, [wallet?.tokens]);

    const points = useMemo(() => {
        return wallet?.points?.filter(platform => Number(platform.points) !== 0);
    }, [wallet?.points]);

    return (
        <li className={`${isSelected ? "selected-michi-wallet" : ""} flex flex-col michi-wallet-list-item`}
            onClick={() => track("Wallet Selected")}>
            <Link href={`${MICHI_WALLET}${wallet.walletAddress}`} className="p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <span
                            className="border-2 border-solid border-custom-gray shadow-custom w-12 h-12 rounded-full mr-2 flex justify-center items-center">
                              <img src={getIconFromChain(wallet.chainId)} alt="Chain Logo" className="h-1/2"/>
                        </span>
                        <span>PICHI WALLET  NFT <br/>#{wallet?.nftIndex} <br/></span>
                    </div>
                    <FaChevronRight/>
                </div>
                <div className="mt-6 flex justify-between">
                    <div className="w-3/4 flex flex-col border-r-2 border-custom-gray pr-10">
                        <span className="block">Balance</span>
                        <span className="gradient-text font-bold text-lg whitespace-nowrap">
                                {tokenCount} Token{tokenCount > 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="w-full ml-10">
                        <span className="block mb-1">
                            Points:
                        </span>
                        <div className="flex">
                            {points?.slice(0, 3).map((value: Point, index: number) =>
                                <img key={index} src={getIconFromPlatform(value.platform)} alt={value.platform}
                                     className="rounded-full w-6 mr-1"/>
                            )} {points && points?.length > 3 ? `+${points?.length - 3}` : ""}
                            {points?.length === 0 && "None"}
                        </div>
                    </div>
                </div>
            </Link>
        </li>);
};

export default WalletList;
