import React, {useEffect} from "react";
import {useRouter} from "next/router";
import {useAccount} from "wagmi";
import {Spinner} from "@nextui-org/react";
import {HOME} from "../../routes/routes";
import Layout from "../../components/layout/Layout";
import NotConnected from "../../components/placeholders/NotConnected";
import {useDispatch, useSelector} from "react-redux";
import {attachUserReferrer, selectReferral} from "../../features/referrals/referralsSlice";
import {toast} from "sonner";
import {UNKNOWN_ERROR} from "../../types/errors";

const Invite = () => {
    const router = useRouter();
    const {iid} = router.query;
    const {address} = useAccount();
    const dispatch = useDispatch();
    const {referrerAttachedStatus, referralAttachedError} = useSelector(selectReferral);

    useEffect(() => {
        if (typeof iid === "string" && address) {
            dispatch(attachUserReferrer({address, affiliateId: iid}));
        }
        if (typeof iid === "string") {
            localStorage.setItem("affiliateId", iid);
        }
    }, [iid, address]);

    useEffect(() => {
        if (referrerAttachedStatus === "success") {
            setTimeout(() => {
                router.push(HOME);
            }, 2000);
        }
        if (referrerAttachedStatus === "failed") {
            toast.error(referralAttachedError || UNKNOWN_ERROR);
        }
    }, [referrerAttachedStatus, referralAttachedError]);

    if (referrerAttachedStatus === "loading") return (
        <Layout>
        <div className="p-6 w-full max-w-6xl mx-auto mt-5">
            <Spinner color="default" size={"lg"}/>
        </div>
        </Layout>
    );

    if (referrerAttachedStatus === "failed") return (
        <Layout>
        <div className="p-6 w-full max-w-6xl mx-auto mt-5">
            <h3>{referralAttachedError || UNKNOWN_ERROR}</h3>
        </div>
        </Layout>
    );

    return (
        <Layout>
        <div className="p-6 w-full max-w-6xl mx-auto mt-5">
            {address ? referrerAttachedStatus === "success" && <h3>Referral #{String(iid)} added successfully!</h3> :
                <NotConnected/>}
        </div>
        </Layout>
    );
};

export default Invite;
