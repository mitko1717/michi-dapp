import axios from "axios";

export const getFromMichiApi = async (url: string) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_HOST}${url}`);
};

let config = {
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
};
export const postToMichiApi = async (url: string, payload: any) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_HOST}${url}`, payload, config);
};