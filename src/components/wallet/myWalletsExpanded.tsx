import React, {useEffect, useState} from "react";
import axios from "axios";
import {useChainId} from "wagmi";
import {Divider, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {Wallet} from "../../types/wallet";
import {chainIdToHex} from "../../utils/formatters";
import {PlatformApiResponse} from "../../types/platform";
import {getIconFromPlatform} from "../../utils/platform";
import {Token} from "../../types/token";
import {getActualBalance} from "../../utils/helpers";
import {TokenizePoints} from "../points/tokenizePoints";
import {PointsBreakdown} from "../points/pointsBreakdown";
import {Deposit} from "../tokens/Deposit";
import {Withdraw} from "../tokens/Withdraw";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import Link from "next/link";
import {MICHI_WALLET} from "../../routes/routes";
import ConnectWallet from "../widgets/ConnectWallet";

const MyWalletsExpanded = () => {
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);
    const status = useSelector((state: AppState) => state.wallet.status);

    if (status === "loading") return <div>Loading...</div>;
    if (status === "failed") return <div>Error: Fetching wallets failed!</div>;

    return (
        <div>
            <div className="grid grid-cols-12 gap-4">
                {michiWallets?.map(wallet => <WalletCard wallet={wallet} key={wallet?.nftIndex}/>)}
            </div>
        </div>
    );
};

type Props = {
    wallet: Wallet
}

const WalletCard: React.FC<Props> = ({wallet}) => {
    const [data, setData] = useState<PlatformApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<Token[]>([]);

    const chainId = useChainId();

    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/points/${wallet.walletAddress}`);
                const _cleanData = response?.data?.filter((platform: PlatformApiResponse) => Number(platform?.points) !== 0);
                setData(_cleanData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        const fetchTokenBalance = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/tokens/${chainIdToHex(chainId)}/${wallet.walletAddress}`);
                const _cleanData = response?.data?.filter((token: Token) => Number(token?.balance) !== 0);
                setBalance(_cleanData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTokenBalance();
        fetchData();
    }, []);

    return (
        <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4">
            <div className="border-2 border-solid border-custom-gray shadow-custom
                bg-custom-gradient rounded-3xl overflow-hidden">
                <div className="p-3 flex flex-row items-center">
                    <img src="./logo.png" alt="Pichi Logo"
                         className="border-2 border-solid border-custom-gray shadow-custom w-10 rounded-full mr-2"/>
                    <span>Pichi Wallet NFT #{wallet?.nftIndex}</span>
                    <Link href={`${MICHI_WALLET}${wallet.walletAddress}`} className="ml-10">View Wallet</Link>
                </div>
                <Divider/>
                <div className="px-4 py-2">
                    <Table removeWrapper aria-label="Tokenized Points"
                           className="border-2 border-solid border-custom-gray shadow-custom bg-custom-gradient my-4 rounded-2xl overflow-hidden">
                        <TableHeader>
                            <TableColumn className="bg-transparent px-6 py-5">Token</TableColumn>
                            <TableColumn className="bg-transparent px-6 py-5">Balance</TableColumn>
                            <TableColumn className="bg-transparent px-6 py-5">Symbol</TableColumn>
                        </TableHeader>
                        <TableBody className="">
                            {balance?.map((token, index) =>
                                <TableRow key={index} className="border-t-2 border-solid border-custom-gray">
                                    <TableCell className="flex flex-row items-center  px-6 py-4">
                                        {token.name}
                                    </TableCell>
                                    <TableCell>{getActualBalance(token)}</TableCell>
                                    <TableCell>{token.symbol}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="flex justify-between gap-2">
                        <Deposit wallet={wallet}/>
                        {balance.length > 0 && <Withdraw wallet={wallet}/>}
                    </div>
                    <ConnectWallet wallet={wallet}/>
                </div>
                <p  className="px-4 py-2">Points:</p>
                <div className="px-4 py-2 flex h-16">
                    {data?.length > 0 ? data?.map((value: PlatformApiResponse, index: number) =>
                            <img key={index} src={getIconFromPlatform(value.platform)} className="rounded-full w-6 mr-2"/>
                        ) :
                        <span className="m-2">No Points Found</span>
                    }
                </div>
                <div className="p-4 pt-0 flex justify-between gap-2">
                    <PointsBreakdown wallet={wallet}/>
                    <TokenizePoints wallet={wallet} points={data}/>
                </div>
            </div>
        </div>
    );
};

export default MyWalletsExpanded;
