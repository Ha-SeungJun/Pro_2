import axios from "axios"
import { API_SERVER_HOST } from "../serverConfig"

const prefix = `${API_SERVER_HOST}/g2i4/payment`

export const acceptedPayment = async(paymentDTO) =>{
    const res = await axios.post(`${prefix}/accepted`,paymentDTO,{
        headers:{ "Content-Type": "application/json" },
})
    return res.data.paymentNo; //이제 paymentNo를 리턴받는다
    
}

export const completePayment = async(paymentNo) =>{
    const res = await axios.post(`${prefix}/complete`,{paymentNo})

    return res.data;
}
