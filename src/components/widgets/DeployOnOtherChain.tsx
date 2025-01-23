import React, {useEffect, useState} from "react";
import {Button, Spinner} from "@nextui-org/react";
import {Chain} from "viem";
import {Wallet} from "../../types/wallet";
import {ethers} from "ethers";
import {Erc6551Implementation, Erc6551Proxy, Erc6551RegistryAddress, Salt} from "../../config/erc6551.config";
import {MichiWalletAddress} from "../../config/michi.config";
import {toast} from "sonner";
import {useChainId, useChains, useSwitchChain, useWriteContract} from "wagmi";
import MultiCallAbi from "../../abis/multicall";
import ErcRegistryABI from "../../abis/ercRegistry";
import WalletInitializeAbi from "../../abis/walletInitialize";
import {TestnetChainId} from "../../types/chain";
import {getIconFromChain} from "../../utils/chain";
import {MulticallAddress} from "../../config/contracts.config";
import {useRouter} from "next/router";
import {initializeTokenboundClient} from "../../hooks/useTokenboundClient";
import {WalletClientError} from "../../types/errors";

type Props = {
    wallet: Wallet
}
const DeployOnOtherChain: React.FC<Props> = ({wallet}) => {
    const chains = useChains();
    const [otherChains, setOtherChains] = useState<Chain[]>([]);

    useEffect(() => {
        if (wallet) {
            setOtherChains(chains.filter((chain) => chain.id !== wallet.chainId && chain.id !== TestnetChainId));
        }
    }, [wallet]);

    return (
        <>
            {
                otherChains.map((chain, index) =>
                    <div className="col-span-4 sm:col-span-1" key={index}>
                        <OtherChainDeployer wallet={wallet} otherChain={chain}/>
                    </div>
                )
            }
        </>
    );
};

type OtherChainProps = {
    wallet: Wallet
    otherChain: Chain
}

const OtherChainDeployer: React.FC<OtherChainProps> = ({wallet, otherChain}) => {
    const router = useRouter();

    const {writeContractAsync, isPending, data: generationData} = useWriteContract();
    const [loading, setLoading] = useState(false);
    const [isAccountDeployed, setIsAccountDeployed] = useState(false);
    const chainId = useChainId();
    const {switchChainAsync} = useSwitchChain();

    const tokenboundClientWalletChain = initializeTokenboundClient(wallet.chainId);
    const tokenboundClientOtherChain = initializeTokenboundClient(otherChain.id);

    useEffect(() => {
        if (tokenboundClientWalletChain && otherChain.id === chainId && tokenboundClientOtherChain) {
            (async () => {
                const isDeployed = await tokenboundClientOtherChain.checkAccountDeployment({
                    accountAddress: wallet.walletAddress as unknown as `0x${string}`,
                });
                setIsAccountDeployed(isDeployed);
            })();
        }else{
            setIsAccountDeployed(false);
        }
    }, [tokenboundClientWalletChain, chainId, tokenboundClientOtherChain]);

    const deployOnOtherChain = async () => {
        setLoading(true);

        try {
            if (otherChain.id !== chainId) {
                await switchChainAsync({chainId: otherChain.id});
                return;
            }

            const iface = new ethers.utils.Interface(ErcRegistryABI);
            const ifaceInit = new ethers.utils.Interface(WalletInitializeAbi);

            const call1 = {
                target: Erc6551RegistryAddress,
                allowFailure: false,
                callData: iface.encodeFunctionData("createAccount", [Erc6551Proxy, Salt, wallet.chainId, MichiWalletAddress, wallet.nftIndex])
            };

            const call2 = {
                target: wallet.walletAddress,
                allowFailure: false,
                callData: ifaceInit.encodeFunctionData("initialize", [Erc6551Implementation])
            };

            await writeContractAsync({
                abi: MultiCallAbi,
                //Multicall address
                address: MulticallAddress,
                functionName: "aggregate3",
                args: [
                    [call1, call2]
                ],
            });

            toast.success("Wallet deployed successfully");
            router.reload();
        } catch (err) {
            const e = err as WalletClientError;

            console.error(e);
            toast.error(e.shortMessage);
            setLoading(false);
        }
        setLoading(false);
    };

    return (
        <div className="pichi-card p-6 h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between mb-6">
                    <p className="text-xl font-semibold max-w-64">Deploy wallet on {otherChain?.name}</p>
                    <img src={getIconFromChain(otherChain?.id)} alt={`${otherChain?.name} Logo`} className="h-12"/>
                </div>
                {chainId !== otherChain?.id && <span className="text-xs mb-4 text-custom-blue-300 block">Switch chain to check if wallet has been deployed</span>}
                <Button className="michi-transparent-button w-full" onClick={() => deployOnOtherChain()}
                        disabled={isAccountDeployed || loading}> {loading && <Spinner color="default" size={"sm"}/>}
                    {chainId !== otherChain?.id ? "Switch chain" : isAccountDeployed ? `Already Deployed` : `Deploy on ${otherChain?.name}`}
                </Button>
            </div>
        </div>
    );
};

export default DeployOnOtherChain;
