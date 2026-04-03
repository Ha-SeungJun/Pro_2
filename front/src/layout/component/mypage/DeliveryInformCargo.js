import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, Container, Button, Chip, Stack
} from '@mui/material';
import PageComponent from '../common/PageComponent';
import { getMyAllEstimateList } from '../../../api/estimateApi/estimateApi';
import { updateDeliveryStatus } from '../../../api/deliveryApi/deliveryApi'; // 새로 추가할 파일/함수
import { useNavigate } from "react-router-dom";

const STATUS = {
  0: { label: '대기', color: 'default' },
  1: { label: '배송 중', color: 'primary' },
  2: { label: '완료', color: 'success' },
};

const initState = {
  dtoList: [],
  pageNumList: [],
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 1,
};

const DriverDeliveryPage = () => {
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });
  const [loadingIds, setLoadingIds] = useState(new Set()); // 상태 변경 중인 행 표시용
  const navigate = useNavigate();

  const handleDetailClick = (matchingNo) => {
    navigate("/mypage/order-summary", { state: { matchingNo } }); // 운전사용 상세 라우트가 다르면 "/driver/order"로 교체
  };

  const optimisticUpdate = (eno, nextStatus) => {
    setServerData(prev => ({
      ...prev,
      dtoList: prev.dtoList.map(row =>
        row.eno === eno ? { ...row, deliveryStatus: nextStatus } : row
      ),
    }));
  };

  const withLoading = async (id, fn) => {
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await fn();
    } finally {
      setLoadingIds(prev => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  const onStart = (row) => withLoading(row.eno, async () => {
    const next = 1; // 대기 -> 배송 중
    optimisticUpdate(row.eno, next);
    await updateDeliveryStatus(row.matchingNo, next);
  });

  const onComplete = (row) => withLoading(row.eno, async () => {
    const next = 2; // 배송 중 -> 완료
    optimisticUpdate(row.eno, next);
    await updateDeliveryStatus(row.matchingNo, next);
  });

  const onCancel = (row) => withLoading(row.eno, async () => {
    const next = 0; // 배송 중 -> 대기(취소)
    optimisticUpdate(row.eno, next);
    await updateDeliveryStatus(row.matchingNo, next);
  });

  useEffect(() => {
    getMyAllEstimateList(pageParams)
      .then((data) => {
        const totalCount = data.length;
        const totalPage = Math.ceil(totalCount / pageParams.size);
        const current = pageParams.page;
        const startIdx = (current - 1) * pageParams.size;
        const endIdx = startIdx + pageParams.size;
        // deliveryStatus 필드가 없다면 기본 0으로 초기화
        const normalized = data.map(d => ({
          ...d,
          deliveryStatus: typeof d.deliveryStatus === 'number' ? d.deliveryStatus : 0
        }));
        const pageData = normalized.slice(startIdx, endIdx);

        const startPage = Math.max(1, current - 2);
        const endPage = Math.min(totalPage, startPage + 4);
        const pageNumList = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

        setServerData({
          dtoList: pageData,
          pageNumList,
          prev: current > 1,
          next: current < totalPage,
          totalCount,
          totalPage,
          prevPage: current > 1 ? current - 1 : 1,
          nextPage: current < totalPage ? current + 1 : totalPage,
          current,
        });
      })
      .catch((err) => {
        console.error("배송 목록 로딩 실패:", err);
      });
  }, [pageParams]);

  const movePage = (pageObj) => {
    setPageParams((prev) => ({ ...prev, ...pageObj }));
  };

  const tableColgroup = (
    <colgroup>
      <col style={{ width: '12%' }} />  {/* 화물명 */}
      <col style={{ width: '10%' }} />  {/* 무게 */}
      <col style={{ width: '26%' }} />  {/* 출발지 */}
      <col style={{ width: '26%' }} />  {/* 도착지 */}
      <col style={{ width: '12%' }} />  {/* 배송 시작일 */}
      <col style={{ width: '14%' }} />  {/* 상세/상태 */}
    </colgroup>
  );

  const renderActionCell = (row) => {
    const { deliveryStatus } = row;
    const busy = loadingIds.has(row.eno);

    if (deliveryStatus === 0) {
      // 대기 -> 배송 시작
      return (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Button variant="outlined" size="small" onClick={() => handleDetailClick(row.matchingNo)}>
            상세보기
          </Button>
          <Button variant="contained" size="small" disabled={busy} onClick={() => onStart(row)}>
            배송 시작
          </Button>
        </Stack>
      );
    }

    if (deliveryStatus === 1) {
      // 배송 중 -> 취소 or 완료
      return (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Button variant="outlined" size="small" onClick={() => handleDetailClick(row.matchingNo)}>
            상세보기
          </Button>
          <Button variant="outlined" size="small" color="warning" disabled={busy} onClick={() => onCancel(row)}>
            배송 취소
          </Button>
          <Button variant="contained" size="small" color="success" disabled={busy} onClick={() => onComplete(row)}>
            배송 완료
          </Button>
        </Stack>
      );
    }

    // 완료 상태
    return (
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
        <Button variant="outlined" size="small" onClick={() => handleDetailClick(row.matchingNo)}>
          상세보기
        </Button>
        <Chip label="완료" color="success" variant="filled" />
      </Stack>
    );
  };

  const renderRow = (row) => (
    <TableRow key={row.eno}>
      <TableCell align="center">{row.cargoType}</TableCell>
      <TableCell align="center">{row.cargoWeight}kg</TableCell>
      <TableCell align="center">{row.startAddress}</TableCell>
      <TableCell align="center">{row.endAddress}</TableCell>
      <TableCell align="center">
        {row.startTime ? new Date(row.startTime).toLocaleDateString() : '-'}
      </TableCell>
      <TableCell align="center">
        <Stack spacing={0.5} alignItems="center">
          <Chip size="small" label={STATUS[row.deliveryStatus]?.label ?? '대기'} color={STATUS[row.deliveryStatus]?.color} />
          {renderActionCell(row)}
        </Stack>
      </TableCell>
    </TableRow>
  );

  const renderTable = (title, filterFn) => {
    const list = serverData.dtoList.filter(filterFn);
    return (
      <Box mt={6}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <TableContainer component={Paper} elevation={1}>
          <Table>
            {tableColgroup}
            <TableHead>
              <TableRow>
                <TableCell align="center">화물명</TableCell>
                <TableCell align="center">무게</TableCell>
                <TableCell align="center">출발지</TableCell>
                <TableCell align="center">도착지</TableCell>
                <TableCell align="center">배송 시작일</TableCell>
                <TableCell align="center">상세 / 상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={6}>데이터가 없습니다.</TableCell>
                </TableRow>
              ) : (
                list.map(renderRow)
              )}
            </TableBody>
          </Table>
          {/* 페이지네이션은 전체 목록 기준으로 하단 하나만 노출 */}
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          운전사 배송 관리
        </Typography>

        {/* 1. 배송 대기 */}
        {renderTable('배송 대기', row => row.deliveryStatus === 0)}

        <Divider sx={{ my: 8 }} />

        {/* 2. 배송 중 */}
        {renderTable('배송 중', row => row.deliveryStatus === 1)}

        <Divider sx={{ my: 8 }} />

        {/* 3. 배송 완료 */}
        {renderTable('배송 완료', row => row.deliveryStatus === 2)}

        <Box mt={4} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
          <PageComponent serverData={serverData} movePage={movePage} />
        </Box>
      </Container>
    </Box>
  );
};

export default DriverDeliveryPage;