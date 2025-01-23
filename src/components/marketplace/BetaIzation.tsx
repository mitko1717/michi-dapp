import React, {useEffect} from "react";
import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure} from "@nextui-org/react";
import {useDispatch, useSelector} from "react-redux";
import {authorizeBeta, getBetaAuthorization} from "../../features/user/userSlice";
import {AppState} from "../../store";

const BetaIzation = () => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const dispatch = useDispatch();
    const {betaAuthorized} = useSelector((state: AppState) => state.user);
    const [password, setPassword] = React.useState("");


    useEffect(() => {
        dispatch(getBetaAuthorization());
        if (betaAuthorized) {
            onClose();
        } else {
            onOpen();
        }
    }, []);

    const handleAccept = () => {
        if (password === "PICHI") {
            dispatch(authorizeBeta());
            onClose();
        }
    };

    const handleKeyDown = (e: { key: string; }) => {
        if (e.key === "Enter") {
            handleAccept();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            size="xl"
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            hideCloseButton={true}
        >
            <ModalContent
                className="border-2 border-solid border-custom-gray shadow-custom overflow-hidden bg-modal-gradient p-12">
                {(onClose) => (
                    <>
                        <ModalBody>
                            <div>
                                <h2 className="text-4xl my-6 text-center">Welcome to our new Marketplace</h2>
                                <p className="text-center">To test our marketplace, please use the password sent with your beta invite!</p>
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex flex-col">
                            <Input
                                variant="bordered"
                                placeholder="Enter Password"
                                className="w-full mb-2"
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button className="pichi-button" onClick={handleAccept}>
                                Accept
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default BetaIzation;
