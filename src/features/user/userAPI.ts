import {Address} from "@ethereumjs/util";
import {getFromMichiApi} from "../../utils/api";
import {MICHIURL} from "../../config/urls.config";

export const fetchUserInfo = async (address: Address) => {
  try {
    const response = await getFromMichiApi(MICHIURL.USER_INFO(address));
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};