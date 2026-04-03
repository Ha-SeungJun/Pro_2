import axios from "axios";
import { API_SERVER_HOST } from "./serverConfig";

const noticeHost = `${API_SERVER_HOST}/api/notices`;

// 공지사항 목록 조회
export const getNotices = async (params = {}) => {
    const { keyword, category, page = 0, size = 10 } = params;

    
    const queryParams = new URLSearchParams();
    if (keyword && keyword.trim() !== '') queryParams.append('keyword', keyword.trim());
    if (category && category !== 'ALL') queryParams.append('category', category);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    const url = `${noticeHost}?${queryParams.toString()}`;
    const res = await axios.get(url);
    return res.data;
};


// 공지사항 카테고리 목록 조회
export const getNoticeCategories = async () => {
    const res = await axios.get(`${noticeHost}/categories`);
    return res.data;
};

// 공지사항 상세 조회

export const getNoticeDetail = async (noticeId) => {
    const res = await axios.get(`${noticeHost}/${noticeId}`);
    return res.data;
};


// 공지사항 생성 (관리자 전용)
export const createNotice = async (noticeData, userInfo = null) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    console.log('NoBoard createNotice - JWT Token:', token ? 'Present' : 'Missing');
    console.log('NoBoard createNotice - Notice data:', noticeData);
    
    const res = await axios.post(noticeHost, noticeData, { headers });
    return res.data;
};

// 공지사항 수정 (관리자 전용)
export const updateNotice = async (noticeId, noticeData, userInfo = null) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    console.log('=== updateNotice API 호출 ===');
    console.log('noticeId:', noticeId);
    console.log('noticeData:', noticeData);
    console.log('JWT Token:', token ? 'Present' : 'Missing');
    console.log('headers:', headers);
    console.log('URL:', `${noticeHost}/${noticeId}`);
    
    try {
        const res = await axios.put(`${noticeHost}/${noticeId}`, noticeData, { headers });
        console.log('=== updateNotice API 응답 ===');
        console.log('응답 데이터:', res.data);
        return res.data;
    } catch (error) {
        console.error('=== updateNotice API 에러 ===');
        console.error('에러 상세:', error);
        console.error('응답 데이터:', error.response?.data);
        console.error('상태 코드:', error.response?.status);
        throw error;
    }
};

// 공지사항 삭제 (관리자 전용)
export const deleteNotice = async (noticeId, userInfo = null) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    console.log('NoBoard deleteNotice - JWT Token:', token ? 'Present' : 'Missing');
    console.log('NoBoard deleteNotice - Notice ID:', noticeId);
    

    const res = await axios.delete(`${noticeHost}/${noticeId}`, { headers });
    return res.data;
};

// 카테고리 한글 매핑
export const getCategoryDisplayName = (categoryValue) => {
    const categoryMap = {
        'GENERAL': '사용안내',
        'SYSTEM': '시스템',
        'SERVICE': '서비스',
        'UPDATE': '업데이트'
    };
    return categoryMap[categoryValue] || categoryValue;
};