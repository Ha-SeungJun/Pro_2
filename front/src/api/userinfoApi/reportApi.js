import axios from "axios"
import { API_SERVER_HOST } from "../serverConfig"
const prefix = `${API_SERVER_HOST}/g2i4/admin/reports`
export const reportUser = async (deNo) =>{
    // Pass the delivery number as a JSON object in the request body
    const res = await axios.post(`${prefix}/userreport`, 
       deNo, // Wrap in a JSON object
        {
            headers: { 'Content-Type': 'application/json' } // Explicitly set Content-Type
        }
    );
    return res.data;
}

export const reportCreate = async(dto) =>{
    const res = await axios.post(`${prefix}/reportcreate`, dto)
    return res.data;
}