import React, {useEffect, useMemo, useState} from "react";
import {Select, SelectItem} from "@nextui-org/react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {useChainId} from "wagmi";
import {Wallet} from "../../types/wallet";
import {ChainId} from "../../types/chain";
import {usePathname} from "next/navigation";
import {MICHI_WALLET} from "../../routes/routes";
import Link from "next/link";
import {getIconFromChain} from "../../utils/chain";
import {FaChevronRight} from "react-icons/fa6";
import {Point} from "../../types/point";
import {getIconFromPlatform} from "../../utils/platform";

const WalletSelector = () => {
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);
    const status = useSelector((state: AppState) => state.wallet.status);

    const currentChainId = useChainId();
    const [sortedMichiWallets, setSortedMichiWallets] = useState<Wallet[]>([]);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isValueSelected, setIsValueSelected] = useState(false);
    
    useEffect(() => {
        const sortedMichiWallets = [...(michiWallets || [])].sort((a, b) => {
            const order = [currentChainId, ChainId.ETHEREUM, ChainId.ARBITRUM, ChainId.OPTIMISM, ChainId.SEPOLIA];
            const indexA = order.indexOf(a.chainId);
            const indexB = order.indexOf(b.chainId);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setSortedMichiWallets(sortedMichiWallets);
    }, [michiWallets, currentChainId]);

    return (
        <div
            className="col-span-6 lg:col-span-2 2xl:col-span-1 bg-custom-gradient border-2 border-custom-gray border-t-0 shadow-custom py-6 overflow-auto overflow-x-hidden block lg:hidden px-6 w-full">
            <Select
                labelPlacement={"outside"}
                label="Select Wallet"
                items={sortedMichiWallets}
                classNames={{
                    label: `text-white-80 font-medium text-lg ${(isSelectOpen || isValueSelected) ? 'pb-6' : ''}`,
                    trigger: "min-h-20 flex items-center justify-between bg-custom-dark-blue text-white-80 rounded-lg border-2 border-solid border-custom-border-light-blue p-4",
                    listboxWrapper: "max-h-[400px] p-0",
                    listbox: "p-0 gap-0",
                }}
                onOpenChange={(isOpen) => {
                    setIsSelectOpen(isOpen);
                }}

                popoverProps={{
                    classNames: {
                        content: "p-0",
                    },
                }}
                renderValue={(items) => {
                    setIsValueSelected(items.length > 0);
                    return items.map((item) => {
                        const wallet = sortedMichiWallets.find(w => String(w.walletAddress) === item.key);
                        return (
                            <div key={item.key} className="flex items-center gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                     <span
                                         className="border-2 border-solid border-custom-gray shadow-custom w-12 h-12 rounded-full mr-2 flex justify-center items-center">
                                          <img src={wallet ? getIconFromChain(wallet.chainId) : ""} alt="Chain Logo"
                                               className="h-1/2"/>
                                    </span>
                                        <span className={"text-white-80"}>PICHI WALLET  NFT <br/>#{wallet?.nftIndex}
                                            <br/></span>
                                    </div>

                                </div>
                            </div>
                        );
                    });
                }}
            >
                {sortedMichiWallets.map((wallet, index) => (
                    <SelectItem hideSelectedIcon={true} key={String(wallet.walletAddress)}
                                className={`p-0 gap-0 border-t-0  rounded-none ${index === 0 ? 'border-b-2 border-custom-gray rounded-t-2xl' : 'border-b-2 border-custom-gray'} ${index === sortedMichiWallets.length - 1 ? 'border-b-0 rounded-b-2xl' : ''} `}>
                        <WalletListItem wallet={wallet} currentIndex={index} walletLength={sortedMichiWallets.length}/>
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};

type Props = {
    wallet: Wallet
    currentIndex: number
    walletLength: number
}

//TODO: Fix This


const WalletListItem: React.FC<Props> = ({wallet, currentIndex, walletLength}) => {
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
        <div
            className={`${(isSelected && currentIndex == 0) ? "selected-michi-wallet rounded-t-2xl" : "" || (isSelected && currentIndex == walletLength - 1) ? "selected-michi-wallet rounded-b-2xl" : "" || isSelected ? "selected-michi-wallet" : ""} flex flex-col p-4 p-y-0`}>
            <Link href={`${MICHI_WALLET}${wallet.walletAddress}`}>
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
        </div>);
};

export default WalletSelector;
