import React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spacer,
    useDisclosure
} from "@nextui-org/react";
import TokenizePointsBreakdown from "./tokenizePointsBreakdown";
import {Wallet} from "../../types/wallet";
import {PlatformApiResponse} from "../../types/platform";

type Props = {
    wallet: Wallet,
    points: PlatformApiResponse[]
}
export const TokenizePoints: React.FC<Props> = ({wallet, points}) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return (
        <>
            <Button onClick={onOpen} className="w-1/2 bg-michi-purple shadow-michi" size="sm"
                    disabled={points.length === 0}>Tokenize Points</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="xl">
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-custom-gradient p-4">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white">
                                Tokenize your points
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-custom-blue">
                                    Continue below to redeem your off-chain points for on-chain tokenized points.
                                </p>
                                <Spacer y={1}/>
                                <TokenizePointsBreakdown points={points}/>
                                <Spacer y={1}/>
                                <p className="text-custom-blue">
                                    The exact tokenized points amount you will receive may change as we verify your
                                    Pichi Wallet’s point balance in our database.
                                </p>
                                <p className="text-white font-bold">
                                    WARNING: You will permanently lose access to your wallet after taking this action.
                                    Please ensure you have withdrawn all your assets before proceeding. Any unwithdrawn
                                    assets cannot be returned.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="border-1 border-solid border-custom-gray bg-transparent text-white"
                                        onPress={onClose}>
                                    Cancel
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