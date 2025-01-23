import {ChainId} from "../../types/chain";
import {getFromMichiApi} from "../../utils/api";
import {MICHIURL} from "../../config/urls.config";

export const fetchApprovedTokens = async (chainId: ChainId) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_APPROVED_TOKENS(chainId));
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};