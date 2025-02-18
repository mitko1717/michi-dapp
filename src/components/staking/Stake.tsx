import React, {useEffect, useMemo} from "react";
import {triggerStakeOrUnstake} from "../../features/user/userSlice";
import {Button, Input, Select, SelectItem, Spinner} from "@nextui-org/react";
import {getActualBalance} from "../../utils/helpers";
import {MaxUint256, Token} from "../../types/token";
import {formatEther, parseEther} from "viem";
import {GiPiggyBank} from "react-icons/gi";
import {useAccount, useChainId, useReadContract, useSwitchChain, useWriteContract} from "wagmi";
import {PichiTokenAbi, PichiTokenAddress} from "../../config/token.config";
import {ChainId} from "../../types/chain";
import {
    StakingAbi,
    StakingContractAddress,
    StakingLPAbi,
    StakingLPAddress,
    StakingLPTokenAddress
} from "../../config/staking.config";
import {DefaultTokenABI} from "../../abis/tokens";
import {WalletClientError} from "../../types/errors";
import {toast} from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store";

export interface StakingToken extends Token {
    stakingAddress: string;
    stakingAbi: any;
}

export let stakingTokens: StakingToken[] = [
    {
        chainId: ChainId.ARBITRUM,
        tokenAddress: PichiTokenAddress,
        name: "Pichi",
        symbol: "PCH",
        balance: "0",
        decimals: 18,
        stakingAddress: StakingContractAddress,
        stakingAbi: StakingAbi
    },
    {
        chainId: ChainId.MANTLE,
        tokenAddress: StakingLPTokenAddress,
        name: "Pichi LP",
        symbol: "PCH/mETH Merchant Moe LP",
        balance: "0",
        decimals: 18,
        stakingAddress: StakingLPAddress,
        stakingAbi: StakingLPAbi
    }
];

const Stake = () => {
    const user = useSelector((state: AppState) => state.user);
    const dispatch = useDispatch();
    const [currentToken, setCurrentToken] = React.useState<StakingToken>();
    const [input, setInput] = React.useState<String>();
    const {address} = useAccount();
    const {writeContractAsync, isPending, data: generationData} = useWriteContract();
    const [loading, setLoading] = React.useState(false);
    const chainId = useChainId();
    const {switchChainAsync} = useSwitchChain();
    const [currentApy, setCurrentApy] = React.useState<string>();
    const [apyLoading, setApyLoading] = React.useState(false);

    useEffect(() => {
        setApy();
    }, []);

    useEffect(() => {
        console.log({currentToken, PichiTokenAddress, currentApy});
    }, [currentToken, PichiTokenAddress, currentApy]);

    const setApy = async () => {
        setApyLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}v1/tokens/apy/0x1388/0`);
        const {apy} = response.data;
        console.log({apy});
        setCurrentApy(apy);
        setApyLoading(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        try {
            if (!e.target.value) {
                return;
            }
            const token = stakingTokens?.find(token => token.symbol === e.target.value);
            switchChainAsync({chainId: token?.chainId as number});
            setCurrentToken(token);
        } catch (e) {
            console.error(e);
        }
    };

    const {data: balance, refetch} = useReadContract({
        address: currentToken?.tokenAddress,
        abi: PichiTokenAbi,
        functionName: "balanceOf",
        args: [
            address
        ]
    });

    useEffect(() => {
        if (balance && currentToken) {
            let _token = {...currentToken, balance};
            setCurrentToken(_token as StakingToken);
        }
    }, [balance]);

    useEffect(() => {
        refetch()
    }, [user.stakeOrUnstakeTriggered])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(value as unknown as number)) {
            setInput(value);
        }
    };

    const {data: currentTokenAllowance, refetch: refetchCurrentTokenAllowance} = useReadContract({
        chainId,
        address: currentToken?.tokenAddress,
        abi: DefaultTokenABI,
        functionName: "allowance",
        args: [
            address,
            currentToken?.stakingAddress
        ]
    });

    const stake = async () => {
        try {
            setLoading(true);
            if (currentToken?.tokenAddress === PichiTokenAddress) {
                await writeContractAsync({
                    abi: StakingAbi,
                    address: StakingContractAddress,
                    functionName: "stake",
                    args: [
                        parseEther(String(input))
                    ],
                });
                toast.success("Staked successfully");
            } else {
                await writeContractAsync({
                    abi: StakingLPAbi,
                    address: StakingLPAddress,
                    functionName: "deposit",
                    args: [
                        0,
                        parseEther(String(input))
                    ],
                });
                toast.success("Staked successfully");
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));

        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        } finally {
            dispatch(triggerStakeOrUnstake())
        }
        setLoading(false);
    };

    const {
        writeContractAsync: writeApprovalContractAsync,
        isPending: isApprovalPending,
        isSuccess: isApprovalSuccess,
        data: hashApproval
    } = useWriteContract();

    const [isApproved, setIsApproved] = React.useState(false);

    const approvedToDeposit = useMemo(
        () => {
            if (currentTokenAllowance && typeof currentTokenAllowance === "bigint") {
                return Number(formatEther(currentTokenAllowance)) >= Number(input);
            }
            return false;
        },
        [input, currentTokenAllowance]
    );

    const approve = async () => {
        setLoading(true);
        try {
            await writeApprovalContractAsync({
                account: address,
                abi: DefaultTokenABI,
                address: currentToken?.tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [
                    currentToken?.stakingAddress,
                    MaxUint256
                ],
            });
            await new Promise((resolve) => setTimeout(resolve, 4000));
            setIsApproved(true);
            refetchCurrentTokenAllowance();
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        }
        await stake();
        setLoading(false);
    };

    const {data: stakingBalance} = useReadContract({
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getAmountStaked",
        args: [
            address
        ]
    });


    return (
        <div>
            <div className="p-4">
                {stakingTokens && <Select
                    items={stakingTokens}
                    label="Select Token"
                    placeholder="Select a token"
                    className="select"
                    onChange={onChange}
                >
                    {(token) => <SelectItem key={token.symbol}
                                            endContent={getActualBalance(token) || ""}>
                        {`${token.symbol}`}
                    </SelectItem>}
                </Select>}
                {currentToken && <div className="flex mt-4">
                    <Input
                        label="Amount to deposit"
                        placeholder="0.00"
                        onChange={handleChange}
                        max={getActualBalance(currentToken)}
                        value={input?.toString()}
                        className="input"
                        endContent={
                            <span
                                className="text-primary flex justify-end text-sm w-1/2">Available: {getActualBalance(currentToken)}</span>
                        }
                        min={0}
                    />
                    <div className="ml-2">
                        <Button
                            className="styled-button h-full"
                            onClick={() => setInput(formatEther(BigInt(currentToken?.balance)))}
                        >
                            Max
                        </Button>
                    </div>
                </div>
                }
            </div>
            <div className="py-2 p-4 pt-0 mb-6">
                {currentToken &&
                    <div className="pichi-card p-4 flex items-center">
                        <div className="mr-5 text-4xl text-primary">
                            <GiPiggyBank/>
                        </div>
                        <div>
                            <p className="text-primary">You will earn</p>
                            {apyLoading ? <Spinner color="default" size={"sm"}/> :
                                <p className="font-bold">{currentToken?.tokenAddress === PichiTokenAddress ? "3x Pichi Points" : `${currentApy || 0}% APY`}</p>
                            }
                        </div>
                    </div>}
                {input && <Button className="pichi-button w-full mt-4 font-semibold"
                                  onClick={() => approvedToDeposit ? stake() : approve()}
                                  disabled={loading}>
                    {loading &&
                        <Spinner color="default" size={"sm"}/>}{approvedToDeposit || isApproved ? "Stake" : "Approve"}
                </Button>}
                {stakingBalance as string && currentToken?.tokenAddress === PichiTokenAddress &&
                    <p className="text-white-70 mt-4 text-sm">Staking cooldown will reset by staking more tokens.</p>}
            </div>
        </div>
    );
};

export default Stake;
