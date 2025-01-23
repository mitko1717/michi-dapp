import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner,} from "@nextui-org/react";
import {useCancelListings} from "../../hooks/cancelListings";
import {useAccount, useChainId} from "wagmi";

type CancelPreviousListingsProps = {
    isOpen: boolean;
    onOpen: () => void;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
};

const CancelPreviousListings: React.FC<CancelPreviousListingsProps> = ({isOpen, onOpen, onOpenChange, onClose}) => {
    const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);
    const {selectedListings, toggleListingSelection, cancelSelectedListings, loading} = useCancelListings();
    const {address} = useAccount();
    const chainId = useChainId();

    useEffect(() => {
        if (currentWallet?.listings) {
            currentWallet.listings.forEach((listing) => {
                toggleListingSelection(String(listing.nonce));
            });
        }
    }, [currentWallet?.listings]);

    useEffect(() => {
        if (isOpen && selectedListings.length === 0) {
            onClose();
        }
    }, [selectedListings]);

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="5xl"
            >
                <ModalContent
                    className="border-1 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                <div>Cancel Previous Listings</div>
                            </ModalHeader>
                            <div className="leaderboard-referral-history-row border-b-solid"/>
                            <ModalBody>
                                <div className="text-white-70 my-2">
                                    You must cancel any previous listings before increasing the price.
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                {address && selectedListings.length > 0 &&
                                    <Button className="pichi-button" disabled={loading}
                                            onClick={() => cancelSelectedListings(address, chainId)}>
                                        {loading && <Spinner color="default" size={"sm"}/>}Cancel Listings
                                    </Button>}
                                <Button className="pichi-button-empty" onClick={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>

    );
};

export default CancelPreviousListings;
