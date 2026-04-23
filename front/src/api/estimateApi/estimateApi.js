import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const prefix = `${API_SERVER_HOST}/g2i4/estimate`


export const postAdd = async (estimateDTO) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.post(`${prefix}/`, estimateDTO, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    withCredentials: true
  })

  return res.data;
}
export const getEstimateList = async (pageParam) => {
  const { page, size } = pageParam;
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.get(`${prefix}/list`, {
    params: { page: page, size: size },
    headers: {
      Authorization: `Bearer ${accessToken}`, 
      "Content-Type": "application/json",
    },
  })
  return res.data;
}

export const postRejected = async (estimateParam) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.post(`${prefix}/subpath/rejected`, { estimateNo: estimateParam },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
      }
    }
  )
  return res.data;
}
export const postAccepted = async (estimateParam) => {
  const accessToken = sessionStorage.getItem("accessToken");
  
  try {
    const res = await axios.post(`${prefix}/subpath/accepted`, 
      { estimateNo: estimateParam }, // 🚨 이 객체 형태가 백엔드 Map.get("estimateNo")와 일치해야 함
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      }
    );
    return res.data;
  } catch (error) {
    // 🚨 [핵심] 400 에러 시 백엔드가 보낸 상세 메시지(무게 불일치 등)를 낚아챕니다.
    if (error.response && error.response.data) {
      // 에러 메시지 자체를 throw 해서 컴포넌트의 catch 문으로 보냅니다.
      throw error; 
    }
    throw error;
  }
}

export const postSaveEs = async (estimateDTO) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.post(`${prefix}/subpath/savedreft`, estimateDTO,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    }
  )
  return res;
}

export const getMyAllEstimateList = async ({ page, size }) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.get(`${prefix}/subpath/my-all-list`, {
    params: { page, size },
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
      }
  },
    
      
    );
  return res.data;
};
// 결제 없는 내 견적 리스트 (GET)
export const getMyUnpaidEstimateList = async ({ page, size }) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.get(`${prefix}/subpath/unpaidlist`, {
    params: { page, size },
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
      }
  },
    
      
    );
  return res.data; // List<EstimateDTO>
};

export const postSearchFeesBasic = async () => {
  const res = await axios.post(`${prefix}/subpath/searchfeesbasic`)
  return res.data;
}
export const getMyPaidEstimateList = async ({ page, size }) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await axios.get(`${prefix}/subpath/paidlist`, {
    params: { page, size },
     withCredentials: true,
    headers: {
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json",
      }
  } );
  return res.data;
}

export const postSearchFeesExtra = async () => {
  const res = await axios.post(`${prefix}/subpath/searchfeesextra`)
  return res.data;
}