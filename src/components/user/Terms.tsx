import React, {useEffect} from "react";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, useDisclosure} from "@nextui-org/react";
import {useDispatch, useSelector} from "react-redux";
import {acceptTerms, getTermsAccepted} from "../../features/user/userSlice";
import {AppState} from "../../store";

const Terms = () => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const dispatch = useDispatch();
    const {termsAccepted} = useSelector((state: AppState) => state.user);


    useEffect(() => {
        dispatch(getTermsAccepted());
        if (termsAccepted) {
            onClose();
        } else {
            onOpen();
        }
    }, []);

    const handleAccept = () => {
        dispatch(acceptTerms());
        onClose();
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
                                <h2 className="text-6xl my-6 text-center">Welcome to Pichi Finance</h2>
                                <p className="text-center">By continuing to Pichi Finance, you agree to our <a
                                    href="https://docs.pichi.finance/additional-information/terms-of-service"
                                    target="_blank" rel="noreferrer noopener" className="text-secondary">Terms of
                                    Service</a></p>
                            </div>

                        </ModalBody>
                        <ModalFooter className="flex flex-col">
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

export default Terms;
