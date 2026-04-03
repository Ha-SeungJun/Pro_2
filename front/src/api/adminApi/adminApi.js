// src/api/adminApi.js
import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const FEES_PREFIX = `${API_SERVER_HOST}/g2i4/admin/fees`;


/** ───── Basic ───── **/
// 통합 조회
export const fetchFeesBasicFull = () => axios.get(`${FEES_PREFIX}/basic/full`);

// 셀 저장
export const saveFeeBasicCell = ({ category, distance, price }) =>
  axios.post(`${FEES_PREFIX}/basic`, { category, distance, price });

// 행 목록 추가/삭제
export const getBasicRows = () => axios.get(`${FEES_PREFIX}/basic/rows`);
export const addBasicRow = (name) => axios.post(`${FEES_PREFIX}/basic/rows`, { name });

export const deleteBasicRow = (name) =>
  axios.delete(`${FEES_PREFIX}/basic/rows`, { params: { weight: name } });

/** ───── Extra ───── **/
export const fetchFeesExtraFull = () => axios.get(`${FEES_PREFIX}/extra/full`);

export const saveFeeExtraCell = ({ category, distance, price }) =>
  axios.post(`${FEES_PREFIX}/extra`, { category, distance, price });

export const getExtraRows = () => axios.get(`${FEES_PREFIX}/extra/rows`);

export const addExtraRow = (name) =>
  axios.post(`${FEES_PREFIX}/extra/rows`, { name });

export const deleteExtraRow = (name) =>
  axios.delete(`${FEES_PREFIX}/extra/rows`, { params: { title: name } });


