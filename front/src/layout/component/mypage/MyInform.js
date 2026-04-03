// MyInform.jsx
import React, { useEffect, useRef, useState } from 'react';
import { getMyInquiries } from '../../../api/qnaApi/qnaApi';
import { getOwnerMonthlyRevenue } from '../../../api/ownerApi/ownerMetricsApi';
import Chart from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import axios from 'axios';
import { getMyAllEstimateList, getMyPaidEstimateList } from '../../../api/estimateApi/estimateApi';

// ===== 공통 API 베이스/인스턴스 =====
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== 유저 타입 파서 =====
const parseUserType = (raw) => {
  const t = raw?.userType || raw?.type || raw?.role || raw?.loginType || null;
  if (t === 'MEMBER' || t === 'CARGO_OWNER') return t;
  const data = raw?.data || raw?.user || raw?.payload || raw?.profile || raw?.account || raw?.result || {};
  const guess = data?.userType || data?.type || data?.role || data?.loginType || null;
  return (guess === 'MEMBER' || guess === 'CARGO_OWNER') ? guess : null;
};

// ===== 헬퍼 =====
const asList = (data) => (Array.isArray(data) ? data : Array.isArray(data?.dtoList) ? data.dtoList : []);

// 최근 6개월 버킷 생성: [{y, m, value:0}]  // ★
const makeLast6MonthBuckets = () => {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ y: d.getFullYear(), m: d.getMonth() + 1, value: 0 });
  }
  return buckets;
};

// 안전한 날짜 파싱(서버 필드명이 다를 수 있어 넓게 커버) // ★
const extractEstimateDate = (it) => {
  const candidates = [
    it?.startTime, it?.start_time,          // ★ estimate 기준일
    it?.orderTime, it?.order_time,          // 혹시 주문일로 들어오는 경우
    it?.createdAt, it?.created_at, it?.regDate, it?.reg_date,
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const norm = typeof raw === 'number' ? raw : String(raw).replace(' ', 'T');
    const d = new Date(norm);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
};

// ===== 차주용 API =====
const getOwnerPaidList = async () => {
  const { data } = await api.get('/g2i4/owner/deliveries/paid');
  return asList(data);
};
const getOwnerCompletedList = async () => {
  const { data } = await api.get('/g2i4/owner/deliveries/completed');
  return asList(data);
};

const MyInform = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [userType, setUserType] = useState(null); // 'MEMBER' | 'CARGO_OWNER'
  const isMember = userType === 'MEMBER';
  const isOwner = userType === 'CARGO_OWNER';

  // 회원 카드용
  const [totalOrders, setTotalOrders] = useState(0);
  // 공통(회원/차주) 지표
  const [inTransitCount, setInTransitCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  // 차주 카드용
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  // 차트용 공통 시리즈: [{year, month, value}]  // ★
  const [monthlySeries, setMonthlySeries] = useState([]);

  // 사용자 타입 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/g2i4/user/info');
        const t = parseUserType(data) || 'MEMBER';
        if (!cancelled) setUserType(t);
      } catch {
        if (!cancelled) setUserType('MEMBER');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 데이터 로딩 (회원: 월별 요청 수 / 차주: 월별 수익)  // ★
  useEffect(() => {
    if (!userType) return;
    (async () => {
      try {
        if (isMember) {
          const all = await getMyAllEstimateList({ page: 1, size: 1000 });
          const list = asList(all);
          setTotalOrders(list.length);

          const paid = await getMyPaidEstimateList({ page: 1, size: 1000 });
          const paidList = asList(paid);
          setInTransitCount(paidList.filter(it => (it.deliveryStatus ?? it.status) === 'IN_TRANSIT').length);
          setCompletedCount(paidList.filter(it => (it.deliveryStatus ?? it.status) === 'COMPLETED').length);

          // ★ 월별 요청 수(estimate.start_time 기준)
          const buckets = makeLast6MonthBuckets();
          for (const it of list) {
            const d = extractEstimateDate(it);
            if (!d) continue;
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const hit = buckets.find(b => b.y === y && b.m === m);
            if (hit) hit.value += 1;
          }
          setMonthlySeries(buckets.map(b => ({ year: b.y, month: b.m, value: b.value })));
        } else if (isOwner) {
          // 차주 지표
          const [paid, completed, revenue] = await Promise.all([
            getOwnerPaidList(),
            getOwnerCompletedList(),
            getOwnerMonthlyRevenue(),
          ]);

          const inTransit = paid.filter(it => (it.deliveryStatus ?? it.status) === 'IN_TRANSIT').length;
          setInTransitCount(inTransit);
          setCompletedCount(completed.length);
          setTotalDeliveries(paid.length + completed.length);

          // 월별 수익 시리즈로 맵핑
          const series = (revenue || []).map(r => ({
            year: r.year, month: r.month, value: r.revenue ?? 0,
          }));
          setMonthlySeries(series);
        }

        // 문의 내역(공통)
        const qnas = await getMyInquiries(10);
        setInquiries(qnas);
      } catch (e) {
        console.error('대시보드 로딩 실패:', e);
        setTotalOrders(0);
        setInTransitCount(0);
        setCompletedCount(0);
        setTotalDeliveries(0);
        setMonthlySeries([]);
        setInquiries([]);
      }
    })();
  }, [userType, isMember, isOwner]);

  // 차트 생성/업데이트  // ★
  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    const chartLabel = isOwner ? '수익' : '요청 수';

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [], datasets: [{
            label: '요청 수', data: [], borderWidth: 2,
            backgroundColor: 'rgba(124, 58, 237, 0.1)', borderColor: 'rgba(124, 58, 237, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,                                   // ★ 정수 단위
                callback: (v) => isOwner ? `${Number(v).toLocaleString()}원` : `${v}건`
              }
            }
          },
          plugins: { legend: { labels: { boxWidth: 10 } } }
        }
      });
    }

    // 최근 6개월 버킷 만들고 서버 데이터 덮어쓰기
    const buckets = makeLast6MonthBuckets();
    for (const row of (monthlySeries || [])) {
      const hit = buckets.find(b => b.y === row.year && b.m === row.month);
      if (hit) hit.value = row.value ?? 0;
    }

    const labels = buckets.map(b => `${b.m}월`);
    const values = buckets.map(b => b.value);

    const chart = chartInstanceRef.current;
    chart.data.labels = labels;
    chart.data.datasets[0].label = chartLabel;                 // ★ 레이블 동적
    chart.data.datasets[0].data = values;
    chart.update();

    // 컴포넌트 교체/언마운트 시 정리(선택)
    return () => { /* 필요 시 chart 파괴 */ };
  }, [monthlySeries, isOwner, isMember]); // ★ 의존성에 타입도 포함

  if (!userType) {
    return <Box sx={{ p: 4 }}><Typography>사용자 정보를 불러오는 중…</Typography></Box>;
  }

  // 카드 정의 (유형별)
  const cards = isMember
    ? [
      ['총 주문건수', `${totalOrders}건`],
      ['배송 중', `${inTransitCount}건`],
      ['배송 완료', `${completedCount}건`],
    ]
    : [
      ['총 배달 건수', `${totalDeliveries}건`],
      ['배송 중', `${inTransitCount}건`],
      ['배송 완료', `${completedCount}건`],
    ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ flexGrow: 1, px: 0 }}>
        <Box sx={{ p: 3, bgcolor: '#f3f4f6' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {isMember ? '배송 정보 관리 (회원)' : '배송 정보 관리 (차주)'}
          </Typography>

          {/* 상태 카드 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, minmax(220px, 1fr))' },
              gap: 1.5, mb: 2, width: '100%',
            }}
          >
            {cards.map(([label, value], idx) => (
              <Paper key={idx} elevation={1} sx={{ p: 2, borderRadius: 2, minHeight: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 0.25 }}>{value}</Typography>
              </Paper>
            ))}
          </Box>

          {/* 그래프 & 문의 내역 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr)' },
              gap: 2, alignItems: 'stretch', width: '100%', mb: 2,
            }}
          >
            {/* 그래프 */}
            <Paper sx={{ p: 2, height: 320, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {isOwner ? '월별 수익' : '월별 요청 수'} {/* ★ 제목 동적 */}
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <Box sx={{ width: 10, height: 10, bgcolor: 'purple', borderRadius: '50%', mr: 1 }} />
                <Typography variant="caption" color="purple">
                  {isOwner ? '수익' : '요청 수'}
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
                <canvas
                  ref={chartRef}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
              </Box>
            </Paper>

            {/* 문의 내역 */}
            <Paper sx={{ p: 2, height: 320, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" align="center" mb={1}>
                내 문의 내역
              </Typography>

              <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">문의내용</TableCell>
                      <TableCell align="center">작성일</TableCell>
                      <TableCell align="center">답변여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inquiries.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={3} sx={{ color: 'text.secondary' }}>
                          최근 문의가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inquiries.map((row, idx) => {
                        const status = row.answered ? '답변 완료' : '미답변';
                        const date = row.createdAt?.slice(0, 10);
                        const clickable = !!row.answered;
                        return (
                          <TableRow
                            key={row.postId ?? idx}
                            hover={clickable}
                            onClick={clickable ? () => navigate('/qaboard') : undefined}
                            sx={{ cursor: clickable ? 'pointer' : 'default' }}
                            title={clickable ? '게시판으로 이동' : '아직 답변이 없습니다.'}
                          >
                            <TableCell align="center" sx={{ textDecoration: clickable ? 'underline' : 'none' }}>
                              {row.title}
                            </TableCell>
                            <TableCell align="center">{date}</TableCell>
                            <TableCell align="center" sx={{ color: row.answered ? 'green' : 'red' }}>
                              {status}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MyInform;
