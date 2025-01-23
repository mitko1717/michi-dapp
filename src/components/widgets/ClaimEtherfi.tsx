import React, {useEffect, useState} from "react";
import {Button} from "@nextui-org/react";
import {encodeFunctionData} from "viem";
import {Wallet} from "../../types/wallet";
import {mainnet} from "wagmi/chains";
import {useChainId, useSwitchChain,} from "wagmi";
import axios from "axios";
import {getIconFromPlatform} from "../../utils/platform";
import {Platform} from "../../types/platform";
import {formatBalance} from "../../utils/formatters";
import {ethers} from "ethers";
import {ClaimContractAbi} from "../../abis/etherfi";
import {toast} from "sonner";
import {initializeTokenboundClient} from "../../hooks/useTokenboundClient";
import {WalletClientError} from "../../types/errors";

type Props = {
    wallet: Wallet
}

const ClaimEtherfi: React.FC<Props> = ({wallet}) => {
    const etherfiClaimAddress = "0x64776B0907b839e759f91a5a328EA143067dDCd7";
    const [loading, setLoading] = useState(false);
    const [isAccountDeployed, setIsAccountDeployed] = useState(false);
    const chainId = useChainId();
    const {switchChainAsync} = useSwitchChain();
    const [claimAmount, setClaimAmount] = useState<string>("0");
    const [weiClaimAmount, setWeiClaimAmount] = useState<string>("0");
    const [index, setIndex] = useState<number>(0);
    const [proof, setProof] = useState<string[]>([]);
    const [claimDisabled, setClaimDisabled] = useState<boolean>(false);
    const [alreadyClaimed, setAlreadyClaimed] = useState<boolean>(false);


    const tokenboundClientWalletChain = initializeTokenboundClient(wallet.chainId);

    useEffect(() => {
        if (wallet.chainId !== 1 && tokenboundClientWalletChain) {
            (async () => {
                const isDeployed = await tokenboundClientWalletChain.checkAccountDeployment({
                    accountAddress: wallet.walletAddress as unknown as `0x${string}`,
                });
                setIsAccountDeployed(isDeployed);
            })();
        } else {
            setIsAccountDeployed(true);
        }
    }, [tokenboundClientWalletChain, chainId, wallet.chainId]);

    useEffect(() => {
        const fetchTokenBalance = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/claim/etherfi?address=${wallet.walletAddress}&allocation=a_1&chainId=1`);
                setWeiClaimAmount(response.data.amount);
                setClaimAmount(ethers.utils.formatUnits(response.data.amount, 18))
                if (response.data.amount === "0" && chainId === 1) {
                    setClaimDisabled(true);
                }
                setIndex(response.data.index);
                setProof(response.data.proof);
                if (chainId === 1 && response.data.index > 0) {
                    let provider = new ethers.providers.Web3Provider(window.ethereum);
                    let contract = new ethers.Contract(etherfiClaimAddress, ClaimContractAbi, provider);
                    let claimed = await contract.isClaimed(response.data.index);
                    setAlreadyClaimed(claimed);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTokenBalance();
    }, [wallet.walletAddress]);

    const handleClaim = async () => {

        setLoading(true);
        try {
            if (index > 0 && wallet.walletAddress && weiClaimAmount != "0" && proof.length > 0) {
                await switchChainAsync({chainId: wallet.chainId});
                const data = encodeFunctionData({
                    abi: ClaimContractAbi,
                    functionName: 'claim',
                    args: [index, wallet.walletAddress, weiClaimAmount, proof],
                });
                await tokenboundClientWalletChain?.execute({
                    account: wallet.walletAddress as unknown as `0x${string}`,
                    to: etherfiClaimAddress,
                    chainId: mainnet.id,
                    value: BigInt(0),
                    data
                });
                setClaimAmount("0");
                setWeiClaimAmount("0");
                await switchChainAsync({chainId});
            }
        } catch (err) {
            const e = err as WalletClientError;
            console.error(e);
            toast.error(e.shortMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col-span-4 sm:col-span-1">
            <div className="pichi-card p-6 h-full">
                <div className="flex flex-col justify-between h-full">
                    <div className="flex justify-between mb-6">
                        <p className="text-xl font-semibold max-w-64">Claim Etherfi</p>
                        <img src={getIconFromPlatform(Platform.ETHERFI)} alt="Logo" className="h-12"/>
                    </div>

                    {chainId !== 1 ? (
                            <span
                                className="text-xs mb-4 text-custom-blue-300 block">Please switch chains to Ethereum to claim.</span>
                        ) :
                        <span
                            className={`text-xs mb-4 text-custom-blue-300 block ${alreadyClaimed && 'hidden'}`}> <span
                            className="font-bold mr-1">Claimable Amount:</span>{formatBalance(claimAmount)}</span>}
                    <Button
                        className="michi-transparent-button w-full"
                        onClick={async () => {
                            if (chainId !== 1) {
                                await switchChainAsync({chainId: 1});
                            } else {
                                await handleClaim();
                            }
                        }}
                        disabled={loading || !isAccountDeployed || claimDisabled || alreadyClaimed}
                    >
                        {chainId !== 1 ? "Switch chain" : alreadyClaimed ? "Already Claimed" : "Claim"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClaimEtherfi;
