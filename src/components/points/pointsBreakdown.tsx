import React from "react";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import WalletPointsBreakdown from "./walletPointsBreakdown";
import {Wallet} from "../../types/wallet";

type Props = {
    wallet: Wallet,
}
export const PointsBreakdown: React.FC<Props> = ({wallet}) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <>
            <Button onClick={onOpen} className="w-1/2 bg-transparent border-1 border-solid border-custom-gray"
                    size="sm">Full Breakdown</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-custom-gradient p-4">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex flex-row items-center">
                                    <img src="./logo.png" alt="Pichi Logo"
                                         className="border-2 border-solid border-custom-gray shadow-custom w-10 rounded-full mr-2"/>
                                    <span className="text-white">Pichi Wallet NFT #{wallet?.nftIndex}</span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <WalletPointsBreakdown/>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="border-1 border-solid border-custom-gray bg-transparent text-white"
                                        onPress={onClose}>
                                    Done
                                </Button>
                                <Button className="bg-michi-purple shadow-michi text-white" onPress={onClose}>
                                    Tokenize Points
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};