import React, {useEffect} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure,
} from "@nextui-org/react";
import {ethers} from "ethers";
import {useChainId} from "wagmi";
import {PichiMarketAbi} from "../../abis/pichi";
import {PichiMarketplaceAddress} from "../../config/michi.config";
import {toast} from "sonner";
import WalletPointsBreakdown from "../points/walletPointsBreakdown";
import {Order} from "../../types/order";
import WalletPrice from "../misc/WalletPrice";
import {useNFTDataAndOffers} from "../../hooks/currentWalletMarketplace";
import {WalletClientError} from "../../types/errors";

interface OrderActionProps {
    listing: Order;
    mode: "cancel" | "acceptOffer";
}

const OrderAction: React.FC<OrderActionProps> = ({listing, mode}) => {
    const [loading, setLoading] = React.useState(false);
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [totalPoints, setTotalPoints] = React.useState("");
    const chainId = useChainId();
    const {fetchOffers} = useNFTDataAndOffers(listing.wallet.wallet_address, chainId);

    useEffect(() => {
        if (listing.points) {
            const _totalPoints = listing.points.reduce((acc, point) => acc + Number(point.points), 0);
            setTotalPoints(_totalPoints.toFixed(2));
        }
    }, [listing]);

    const constructOffer = () => {
        const sig = ethers.utils.splitSignature(listing.signature);
        const date = new Date(listing.expiry);
        const unixTimestamp = Math.floor(date.getTime() / 1000);

        return {
            order: {
                collection: listing.collection,
                currency: listing.currency,
                tokenId: listing.tokenId,
                amount: listing.amount,
                expiry: unixTimestamp,
            },
            buyer: listing.participant,
            v: sig.v,
            r: sig.r,
            s: sig.s,
            nonce: listing.nonce,
        };
    };

    const executeTransaction = async () => {
        setLoading(true);
        try {
            if (mode === "acceptOffer") {
                const offer = constructOffer();
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(PichiMarketplaceAddress, PichiMarketAbi, signer);
                let tx = await contract.acceptOffer(offer);
                await tx.wait();
                toast.success("Offer Accepted Successfully!");
                fetchOffers(listing.tokenId);
            }
        } catch (err) {
            const e = err as WalletClientError;

            console.error(e);
            toast.error(e?.shortMessage || "An error occurred");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <>
            <Button onClick={onOpen} className="pichi-button-empty m-auto items-center">
                {mode === "cancel" ? "Cancel Listing" : "Accept Offer"}
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient">
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-white font-medium py-6">
                            <div>{mode === "cancel" ? "Confirm Cancellation" : "Accept Offer"}</div>
                        </ModalHeader>
                        <ModalBody>
                            <div>
                                <h2 className="text-medium text-subtitle">Pichi Wallet #{listing.tokenId}</h2>
                                {listing && <WalletPrice order={listing}/>}
                            </div>
                            <div className="leaderboard-referral-history-row border-b-solid"></div>
                            <div className="flex justify-between items-center">
                                <h2 className="text-medium text-subtitle">Total Points</h2>
                                <p className="text-other-side text-medium">{totalPoints}</p>
                            </div>
                            <div className="leaderboard-referral-history-row border-b-solid"></div>
                            <h2 className="text-medium text-subtitle">Points</h2>
                            <WalletPointsBreakdown showScrollbar={true}/>
                        </ModalBody>
                        <ModalFooter className="flex flex-col">
                            <Button className="pichi-button" onClick={executeTransaction}>
                                {loading && <Spinner size="sm" color="default"/>} Confirm
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

export default OrderAction;