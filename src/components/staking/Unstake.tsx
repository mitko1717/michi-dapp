import React, {useEffect, useMemo} from "react";
import {triggerStakeOrUnstake} from "../../features/user/userSlice";
import {Button, Input, Select, SelectItem, Spinner} from "@nextui-org/react";
import {useAccount, useReadContract, useSwitchChain, useWriteContract} from "wagmi";
import {formatEther, parseEther} from "viem";
import {StakingAbi, StakingContractAddress, StakingLPAbi, StakingLPAddress} from "../../config/staking.config";
import {WalletClientError} from "../../types/errors";
import {toast} from "sonner";
import Moment from "react-moment";
import {StakingToken, stakingTokens} from "./Stake";
import {getActualBalance} from "../../utils/helpers";
import {PichiTokenAddress} from "../../config/token.config";
import { useDispatch } from "react-redux";

const Unstake = () => {
    const dispatch = useDispatch();
    const [currentToken, setCurrentToken] = React.useState<StakingToken>();
    const [input, setInput] = React.useState<String>();
    const {address} = useAccount();
    const {writeContractAsync, isPending, data: generationData} = useWriteContract();
    const [loading, setLoading] = React.useState(false);
    const [_balance, setBalance] = React.useState<string>("0");
    const {switchChainAsync} = useSwitchChain();

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
        address: StakingContractAddress,
        abi: StakingAbi,
        functionName: "getAmountStaked",
        args: [
            address
        ]
    });

    const {data: balance2} = useReadContract({
        address: StakingLPAddress,
        abi: StakingLPAbi,
        functionName: "userToPoolInfo",
        args: [
            0,
            address
        ]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(value as unknown as number)) {
            setInput(value);
        }
    };

    const {data: stakingCooldown} = useReadContract({
        address: currentToken?.stakingAddress as `0x${string}`,
        abi: currentToken?.stakingAbi,
        functionName: "getCooldownEnd",
        args: [
            address as `0x${string}`
        ]
    });

    useEffect(() => {
        if (balance) {
            let _token = {...currentToken, balance};
            setBalance(balance as string);
            setCurrentToken(_token as StakingToken);
        } else if (balance2) {
            // @ts-ignore
            setBalance(balance2[0] as string);
            // @ts-ignore
            let _token = {...currentToken, balance: balance2[0]};
            setCurrentToken(_token as StakingToken);
        }
    }, [balance, balance2]);

    const unstakeAllowed = useMemo(() => {
        if (stakingCooldown) {
            const cooldownTimestamp = Number(String(stakingCooldown)) * 1000;
            const currentTimestamp = Date.now();
            return currentTimestamp >= cooldownTimestamp;
        } else if (currentToken?.tokenAddress !== PichiTokenAddress) {
            return true;
        }
        return false;
    }, [stakingCooldown]);

    const unstake = async () => {
        try {
            setLoading(true);
            if (currentToken?.tokenAddress === PichiTokenAddress) {
                await writeContractAsync({
                    abi: StakingAbi,
                    address: StakingContractAddress,
                    functionName: "unstake",
                    args: [
                        parseEther(String(input))
                    ],
                });
            } else {
                await writeContractAsync({
                    abi: StakingLPAbi,
                    address: StakingLPAddress,
                    functionName: "withdraw",
                    args: [
                        0,
                        parseEther(String(input))
                    ],
                });
            }
        } catch (err) {
            const e = err as WalletClientError;
            toast.error(e?.shortMessage);
            console.error(e);
        } finally {
            dispatch(triggerStakeOrUnstake())
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            {/*<h2 className="text-4xl font-bold">Unstake Tokens</h2>*/}
            {/*<p className="text-white-70 font-medium">Unstaking will result in 3x Pichi Points no longer being*/}
            {/*    earned.</p>*/}
            <div className="mt-0">
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
                {currentToken?.tokenAddress && unstakeAllowed &&
                    <div className="flex mt-4">
                        <Input
                            label="Amount to unstake"
                            placeholder="0.00"
                            onChange={handleChange}
                            max={getActualBalance(currentToken)}
                            value={input?.toString()}
                            className="input"
                            endContent={
                                <span
                                    className="text-primary flex justify-end mb-1 text-sm w-1/2">Available: {formatEther(BigInt(_balance))}</span>
                            }
                            min={0}
                        />
                        <div className="ml-2">
                            <Button
                                className="styled-button h-full"
                                onClick={() => setInput(formatEther(BigInt(_balance)))}
                            >
                                Max
                            </Button>
                        </div>
                    </div>
                }
                {unstakeAllowed && input ?
                    <Button className="pichi-button w-full mt-4 font-semibold" onClick={() => unstake()}
                            disabled={loading || !input}>
                        {loading && <Spinner color="default" size={"sm"}/>}Unstake
                    </Button> :
                    stakingCooldown ? <p className="text-white-70 mt-2 text-sm">
                        You can unstake <Moment fromNow>{Number(stakingCooldown) * 1000}</Moment>
                    </p> : null
                }
            </div>
        </div>
    );
};

export default Unstake;
