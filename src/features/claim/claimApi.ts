import {EvmAddress} from "../../types/address";
import axios from "axios";
import {MICHIURL} from "../../config/urls.config";
import {axiosGetConfig} from "../../config/axios.config";

export const fetchClaimDetails = async (address: EvmAddress) => {
    try {
        const response = await axios.get(MICHIURL.MICHI_USER_GET_CLAIM_DETAILS(address), {
            ...axiosGetConfig
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders: ", error);
        throw error;
    }
};