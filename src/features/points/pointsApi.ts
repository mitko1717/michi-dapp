import {getFromMichiApi} from "../../utils/api";
import {MICHIURL} from "../../config/urls.config";

export const fetchLeaderboardPoints = async (offset = 0) => {
    try {
        const response = await getFromMichiApi(MICHIURL.MICHI_POINTS_LEADERBOARD(100, offset));
        return response.data.users;
    } catch (error) {
        console.error(error);
        throw error;
    }
};