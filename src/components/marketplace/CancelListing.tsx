import React, {useEffect} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@nextui-org/react";
import {useAccount, useChainId, useConfig, useWriteContract} from "wagmi";
import {PichiMarketAbi} from "../../abis/pichi";
import {PichiMarketplaceAddress} from "../../config/michi.config";
import {toast} from "sonner";
import {waitForTransactionReceipt} from "wagmi/actions";
import {Order} from "../../types/order";
import {NumOfConfirmationsToWaitFor} from "../../config/wagmi.config";
import {fetchCurrentNonce, updateOrderStatus} from "../../features/orders/orderAPI";
import {chainIdToHex} from "../../utils/formatters";
import WalletPrice from "../misc/WalletPrice";

interface OrderActionProps {
    listing?: Order;
    cancelAll?: boolean;
    totalListings?: Order[];
}

const CancelListing: React.FC<OrderActionProps> = ({listing, cancelAll, totalListings}) => {
    const [loading, setLoading] = React.useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const {writeContractAsync, data: txHash} = useWriteContract();
    const [totalPoints, setTotalPoints] = React.useState("");
    const config = useConfig();
    const {address} = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        if (listing?.points) {
            const _totalPoints = listing.points.reduce((acc, point) => acc + Number(point.points), 0);
            setTotalPoints(_totalPoints.toFixed(2));
        }
    }, [listing, cancelAll]);

    const submittedTransaction = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
            confirmations: NumOfConfirmationsToWaitFor
        });

        if (transactionReceipt.status === "success") {
            setLoading(false);
            await updateOrderStatus(chainId, txHash, cancelAll || false);
            toast.success(listing ? "Listing canceled successfully!" : "Listings cancelled successfully!");
        } else {
            toast.error("Transaction failed");
        }
    };

    const executeTransaction = async () => {
        setLoading(true);
        let tx;
        try {
            if (listing) {
                tx = await writeContractAsync({
                    account: address,
                    abi: PichiMarketAbi,
                    chainId,
                    address: PichiMarketplaceAddress,
                    functionName: "cancelOrdersForCaller",
                    args: [[listing.nonce]],
                });
            } else if (address) {

                let nonce = await fetchCurrentNonce(chainIdToHex(chainId), address);
                tx = await writeContractAsync({
                    account: address,
                    abi: PichiMarketAbi,
                    chainId,
                    address: PichiMarketplaceAddress,
                    functionName: "cancelAllOrdersForCaller",
                    args: [nonce],
                });
            }
            if (tx) await submittedTransaction(tx);

        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
            setLoading(false);
        } finally {
            onClose();
        }
    };
    return (
        <>
            <Button onClick={onOpen} className="pichi-button-empty items-center capitalize">
                {listing ? `Cancel ${listing.type?.toLowerCase()}` : "Cancel All"}
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient">
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-white font-medium py-6">
                            <div>Confirm Cancellation</div>
                        </ModalHeader>
                        <ModalBody>
                            <div>
                                {listing ?
                                    <div>
                                        <h2 className="text-medium text-subtitle">Pichi Wallet #{listing?.tokenId}</h2>
                                        {listing && <div className="flex items-center"><span className="mr-1">Current Price:</span>
                                            <WalletPrice order={listing}/></div>}
                                    </div> : <h2 className="text-medium text-subtitle">Cancel All Orders</h2>}
                            </div>
                            {cancelAll && totalListings ? <>
                                    <Table removeWrapper aria-label="Tokenized Points"
                                           className={`text-white border-1 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl max-h-52 overflow-y-auto scrollbar-thin`}
                                    >
                                        <TableHeader>
                                            <TableColumn className="bg-transparent px-6 py-5">ID</TableColumn>
                                            <TableColumn
                                                className="bg-transparent py-5 cursor-pointer ">Listed Price</TableColumn>
                                        </TableHeader>
                                        <TableBody className="">
                                            {totalListings?.map((listing) => (
                                                <TableRow key={listing.tokenId}
                                                          className="border-t-1 border-solid border-custom-gray">
                                                    <TableCell className="px-6 py-5 flex items-center">
          <span className="w-10 h-10 rounded-full mr-2 flex justify-center items-center icon-custom icon-container">
            <img src="/logo.png" alt="Chain Logo" className="h-1/2"/>
          </span>
                                                        PICHI WALLET NFT <br/> # {listing.tokenId}
                                                    </TableCell>
                                                    <TableCell className="py-5">
                                                        <WalletPrice order={listing}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </> :
                                <>
                                    <div className="leaderboard-referral-history-row border-b-solid"></div>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-medium text-subtitle">Total Points</h2>
                                        <p className="text-other-side text-medium">{totalPoints}</p>
                                    </div>
                                    <div className="leaderboard-referral-history-row border-b-solid"></div>
                                </>}
                        </ModalBody>
                        <ModalFooter className="flex flex-col">
                            <Button className="pichi-button" onClick={executeTransaction}>
                                {loading && <Spinner color="default" size={"sm"}/>} Confirm
                            </Button>
                            <Button className="pichi-button-empty" onClick={onClose}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CancelListing;
