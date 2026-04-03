import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";


const prefix = `${API_SERVER_HOST}/g2i4/subpath/order`

export const postOrderPome = async (matchingNo) =>{
    const res = await axios.post(`${prefix}/`,{mcNo:matchingNo})
    return res.data;
}

export const postOrderCreate = async (orderSheetDTO) =>{
    const res =await axios.post(`${prefix}/create`,orderSheetDTO)
    return res.data
}