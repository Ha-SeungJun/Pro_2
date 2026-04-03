import axios from "axios";

export const API_SERVER_HOST = "http://localhost:3000";

const myhost = `${API_SERVER_HOST}/api/users`

export const loginPost = async (loginParam) => {
    const form = new FormData();

    form.append('username', loginParam.id)
    form.append('password', loginParam.pw)

    const res = await axios.post(`${myhost}/login`, form);
    return res.data;
}