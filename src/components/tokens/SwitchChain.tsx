import React from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import {Wallet} from "../../types/wallet";
import { useSwitchChain} from "wagmi";
import {toast} from "sonner";

type Props = {
    title: string;
    description: string;
    wallet: Wallet;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
};
export const SwitchChain: React.FC<Props> = ({title, description, wallet, isOpen, onClose}) => {
    const {switchChainAsync} = useSwitchChain();
    const [loading, setLoading] = React.useState(false);

    const handleSwitchChain = async () => {
        setLoading(true);
        try {
            await switchChainAsync({chainId: wallet.chainId});
            onClose();
        } catch (error) {
            console.error("User rejected the switch:", error);
            toast.error("Switch chain request was rejected.");
        }
        setLoading(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" size="xl">
                <ModalContent
                    className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-custom-gradient p-4">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-white font-medium">
                                {title}
                            </ModalHeader>
                            <ModalBody>

                                <div className="flex">
                                    {description}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="pichi-button w-full"
                                        disabled={loading}
                                        onClick={handleSwitchChain}
                                >
                                    Switch Chain
                                </Button>

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};