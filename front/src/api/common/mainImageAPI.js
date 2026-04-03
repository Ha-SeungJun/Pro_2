import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";



export const uploadImage = async (tno,file) =>{
  const form = new FormData();
  form.append("image",file)
  const res = await axios.put(`${API_SERVER_HOST}/g2i4/admin/fees/imageupload/${tno}`,form,{
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res;
}

export const basicList = async () =>{
  const res = await axios.post(`${API_SERVER_HOST}/g2i4/main/getfeeslist`)
  return res.data;
}
