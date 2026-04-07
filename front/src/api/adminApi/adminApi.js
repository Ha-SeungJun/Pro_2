// src/api/adminApi.js
import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const FEES_PREFIX = `${API_SERVER_HOST}/g2i4/admin/fees`;


/** ───── Basic ───── **/
// 통합 조회
export const fetchFeesBasicFull = () => axios.get(`${FEES_PREFIX}/basic/full`);

// [수정 완료] 셀 저장/행 저장 통합 (객체를 통째로 서버에 전달)

export const saveFeeBasicCell = (data) => axios.post(`${FEES_PREFIX}/basic`, data);

// 행 목록 추가/삭제
export const getBasicRows = () => axios.get(`${FEES_PREFIX}/basic/rows`);
export const addBasicRow = (name, cargoName) =>
  axios.post(`${FEES_PREFIX}/basic/rows`, { name, cargoName });

export const deleteBasicRow = (name) =>
  axios.delete(`${FEES_PREFIX}/basic/rows`, { params: { weight: name } });

/** ───── Extra ───── **/
export const fetchFeesExtraFull = () => axios.get(`${FEES_PREFIX}/extra/full`);

export const saveFeeExtraCell = (data) =>
  axios.post(`${FEES_PREFIX}/extra`, data);

export const getExtraRows = () => axios.get(`${FEES_PREFIX}/extra/rows`);

export const addExtraRow = (name) =>
  axios.post(`${FEES_PREFIX}/extra/rows`, { name });

export const deleteExtraRow = (name) =>
  axios.delete(`${FEES_PREFIX}/extra/rows`, { params: { title: name } });


