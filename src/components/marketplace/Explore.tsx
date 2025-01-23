import React, {ChangeEvent, useEffect, useState} from "react";
import {Tab, Tabs} from "@nextui-org/tabs";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../store";
import {getIconFromChain} from "../../utils/chain";
import {Point} from "../../types/point";
import {getIconFromPlatform} from "../../utils/platform";
import {Button, Tooltip} from "@nextui-org/react";
import {MARKETPLACE_WALLET} from "../../routes/routes";
import Link from "next/link";
import {getRecentlySoldOrders} from "../../features/marketplace/marketplaceSlice";
import {useChainId} from "wagmi";
import {chainIdToHex, hexToChainId} from "../../utils/formatters";
import {OrderType} from "../../features/orders/orderAPI";
import {Order} from "../../types/order";
import WalletPrice from "../misc/WalletPrice";
import {ChainId} from "../../types/chain";
import {ArbitrumTokenAddresses, EthereumTokenAddresses, SepoliaTokenAddresses} from "../../config/contracts.config";
import PointsMarketCarousel from "./PointsMarketCarousel";
import ReferralBanner from "./ReferralBanner";

const Explore = () => {
    const orders = useSelector((state: AppState) => state.marketplace.orders);
    const recentlySold = useSelector((state: AppState) => state.marketplace.recentlySoldOrders);
    const [selectedPoint, setSelectedPoint] = useState('All Points');
    const [selectedCurrency, setSelectedCurrency] = useState('All Currencies');
    const [filter, setFilter] = useState('High to low');
    const [sortOrder, setSortOrder] = useState('');
    const [platformList, setPlatformList] = useState<string[]>([]);

    useEffect(() => {
        const pointsSet = new Set<string>();
        orders?.forEach(order => {
            order?.points.forEach(point => pointsSet.add(point.platform));
        });
        setPlatformList(['All Points', ...Array.from(pointsSet)]);
    }, [orders]);

    const chainId = useChainId();

    const capitalizeFirstLetter = (string: string): string => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };
    const handlePointChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setSelectedPoint(e.target.value);
    };

    const handleCurrencyChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setSelectedCurrency(e.target.value);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setFilter(e.target.value);
        setSortOrder('');
    };

    const handleSortOrderChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setSortOrder(e.target.value);
        setFilter('');
    };

    const filterAndSortOrders = (orders: Order[] | null, point: string, filter: string, sortOrder: string, chainId: number,currency: string,): Order[] => {
        if (!orders) {
            return [];
        }

        let filteredOrders = point === 'All Points' ? orders : orders.filter(order =>
            order.points && order.points.some(p => p.platform === point)
        );

        const getCurrencyWETH = (order: Order): boolean => {
            if (chainId === ChainId.ETHEREUM) return order.currency.toLowerCase() === EthereumTokenAddresses.WETH.toLowerCase();
            if (chainId === ChainId.ARBITRUM) return order.currency.toLowerCase() === ArbitrumTokenAddresses.WETH.toLowerCase();
            if (chainId === ChainId.SEPOLIA) return order.currency.toLowerCase() === SepoliaTokenAddresses.WETH.toLowerCase();
            return false;
        };

        const getCurrencyUSDC = (order: Order): boolean => {
            if (chainId === ChainId.ETHEREUM) return order.currency.toLowerCase() === EthereumTokenAddresses.USDC.toLowerCase();
            if (chainId === ChainId.ARBITRUM) return order.currency.toLowerCase() === ArbitrumTokenAddresses.USDC.toLowerCase();
            if (chainId === ChainId.SEPOLIA) return order.currency.toLowerCase() === SepoliaTokenAddresses.USDC.toLowerCase();
            return false;
        };
        filteredOrders = currency === 'All Currencies' ? filteredOrders : filteredOrders.filter(order => {
            if (currency === 'WETH') {
                return getCurrencyWETH(order);
            } else if (currency === 'USDC') {
                return getCurrencyUSDC(order);
            } else if (currency === 'USDT') {
                return !getCurrencyWETH(order) && !getCurrencyUSDC(order);
            }
            return false;
        })

        filteredOrders = [...filteredOrders];

        if (sortOrder === 'Newest' || sortOrder === 'Oldest') {
            return sortByDate(filteredOrders, sortOrder);
        }

        filteredOrders.sort((a, b) => {
            const aCurrencyWETH = getCurrencyWETH(a);
            const bCurrencyWETH = getCurrencyWETH(b);

            const aCurrencyUSDC = getCurrencyUSDC(a);
            const bCurrencyUSDC = getCurrencyUSDC(b);

            const aAmount = parseFloat(a.amount);
            const bAmount = parseFloat(b.amount);

            if (aCurrencyWETH && !bCurrencyWETH) return -1;
            if (!aCurrencyWETH && bCurrencyWETH) return 1;
            if (aCurrencyUSDC && !bCurrencyUSDC) return -1;
            if (!aCurrencyUSDC && bCurrencyUSDC) return 1;

            if (filter === 'High to low') {
                return bAmount - aAmount;
            } else {
                return aAmount - bAmount;
            }
        });

        return filteredOrders;
    };

    const sortByDate = (orders: Order[], sortOrder: string): Order[] => {
        return [...orders].sort((a, b) => {
            const aDate = new Date(a.date).getTime();
            const bDate = new Date(b.date).getTime();

            if (sortOrder === 'Newest') {
                return bDate - aDate;
            } else {
                return aDate - bDate;
            }
        });
    };

    let filteredWallets = filterAndSortOrders(orders, selectedPoint, filter, sortOrder, chainId,selectedCurrency);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getRecentlySoldOrders({chainId: chainIdToHex(chainId), type: OrderType.Listing}));
    }, [chainId]);

    // As part of the refacotring will update the select to Select
    return (
        <>
            <PointsMarketCarousel setSelectedPoint={setSelectedPoint}/>
            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl">Explore</h2>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4 items-center">
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2">Sort by:</label>
                            <select id="sort" className="bg-transparent border-none" onChange={handleSortOrderChange}>
                                <option className="bg-custom-dark-blue" value="Newest">Newest</option>
                                <option className="bg-custom-dark-blue" value="Oldest">Oldest</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="filter" className="mr-2">Filter by:</label>
                            <select id="filter" className="bg-transparent border-none" onChange={handleFilterChange}>
                                <option className="bg-custom-dark-blue" value="High to low">High to low</option>
                                <option className="bg-custom-dark-blue" value="Low to high">Low to high</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="points" className="mr-2">Points:</label>
                            <select id="points" className="bg-transparent border-none"
                                    onChange={handlePointChange} value={selectedPoint}>
                                {platformList.map(point => (
                                    <option key={point} value={point}
                                            className="bg-custom-dark-blue">{capitalizeFirstLetter(point)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2">Currency</label>
                            <select id="sort" className="bg-transparent border-none" onChange={handleCurrencyChange}>
                                <option className="bg-custom-dark-blue" value="All Currencies">All</option>
                                <option className="bg-custom-dark-blue" value="WETH">WETH</option>
                                <option className="bg-custom-dark-blue" value="USDC">USDC</option>
                                <option className="bg-custom-dark-blue" value="USDT">USDT</option>
                            </select>
                        </div>
                    </div>
                </div>
                <Tabs aria-label="Options" className="flex" variant="bordered">
                    <Tab key="active" title="Active Listings">
                        <div className="mt-6">
                            <div className="grid grid-cols-12 gap-6">
                                {filteredWallets.map((order, index) =>
                                    <MarketCard order={order} key={index}/>
                                )}
                            </div>
                        </div>
                    </Tab>
                    <Tab key="sold" title="Recently Sold">
                        <div className="mt-6 w-full">
                            <ReferralBanner/>
                            {/*<div className="grid grid-cols-12 gap-6">*/}
                            {/*    {recentlySold?.map((order, index) =>*/}
                            {/*        <MarketCard order={order} key={index}/>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </>
    );
};

const MarketCard = ({order}: { order: Order }) => {
    return (
        <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 market-card">
            <Link href={`${MARKETPLACE_WALLET}${order?.wallet?.wallet_address}`}>
                <div className="flex items-center p-4">
                    <span
                        className="w-12 h-12 rounded-full mr-2 flex justify-center items-center icon-custom icon-container">
                        <img src={getIconFromChain(hexToChainId(order?.chainId))} alt="Chain Logo" className="h-1/2"/>
                    </span>
                    <span>PICHI WALLET  NFT <br/>#{order?.tokenId} <br/></span>
                </div>
                <div className="flex flex-col my-2 p-4 border-t border-b border-border-color">
                    <span className="block mb-1">Points:</span>
                    <div className="flex">
                        {order?.points?.slice(0, 6).map((value: Point, index: number) =>
                            <Tooltip key={index} content={Number(value.points).toFixed(2)} className="p-2">
                                <img key={index} src={getIconFromPlatform(value.platform)}
                                     alt={value.platform}
                                     className="rounded-full w-6 mr-1"/>
                            </Tooltip>
                        )} {order?.points && order?.points?.length > 6 ? `+${order?.points?.length - 6}` : ""}
                        {order?.points?.length === 0 && "None"}
                    </div>
                </div>
                <div className="flex justify-between px-4 mt-6 mb-2">
                    <span className="block">Price</span>
                    <WalletPrice order={order}/>
                </div>
                <div className="p-4">
                    <Button className="pichi-button w-full">Buy Now</Button>
                    <Button className="pichi-button-empty w-full mt-2">Offer</Button>
                </div>
            </Link>
        </div>
    );
};

export default Explore;
