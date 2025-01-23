import {getFromMichiApi, postToMichiApi} from "../../utils/api";
import {MICHIURL} from "../../config/urls.config";
import {EvmAddress} from "../../types/address";

export const fetchUserReferralHistory = async (address: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_USER_REFERRAL_HISTORY(address));
        return response.data;

    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchUserReferralLink = async (address: EvmAddress) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_USER_GET_REFERRAL(address));
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const postUserReferrer = async (address: EvmAddress, affiliateId: string) => {
    try {
        const response = await postToMichiApi(MICHIURL.MICHI_USER_ATTACH_REFERRER(), {address, affiliateId});
        return response.data;
    } catch (error) {
        throw error;
    }
};