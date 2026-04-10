import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PageComponent from "../common/PageComponent";
import { getReceivedReviews } from "../../../api/reviewApi/reviewApi";

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

const parseDateSmart = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (v) => {
  const d = parseDateSmart(v);
  if (!d) return "-";
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const paginate = (data, { page, size }) => {
  const totalCount = data.length;
  const totalPage = Math.max(1, Math.ceil(totalCount / size));
  const current = Math.min(Math.max(1, page), totalPage);
  const startIdx = (current - 1) * size;
  const endIdx = startIdx + size;
  const pageData = data.slice(startIdx, endIdx);

  const startPage = Math.max(1, current - 2);
  const endPage = Math.min(totalPage, startPage + 4);
  const pageNumList = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return {
    dtoList: pageData,
    pageNumList,
    prev: current > 1,
    next: current < totalPage,
    totalCount,
    totalPage,
    prevPage: current > 1 ? current - 1 : 1,
    nextPage: current < totalPage ? current + 1 : totalPage,
    current,
  };
};

const ReceivedReviewInform = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });
  const [loading, setLoading] = useState(true);

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedDetailReview, setSelectedDetailReview] = useState(null);

  const movePage = (pageObj) => {
    setPageParams((prev) => ({ ...prev, ...pageObj }));
  };

  const applyPagedData = (list, nextPageParams = pageParams) => {
    const sorted = [...list].sort((a, b) => {
      const A = a?.reviewNo ?? 0;
      const B = b?.reviewNo ?? 0;
      return B - A;
    });

    setServerData(paginate(sorted, nextPageParams));
  };

  const handleOpenDetailModal = (item) => {
    setSelectedDetailReview(item);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedDetailReview(null);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchReceivedReviews = async () => {
      try {
        setLoading(true);

        const data = await getReceivedReviews();
        const list = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setAllReviews(list);
          applyPagedData(list, pageParams);
        }
      } catch (error) {
        console.error("받은 리뷰 목록 조회 실패:", error);
        if (!cancelled) {
          setAllReviews([]);
          setServerData(paginate([], pageParams));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReceivedReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyPagedData(allReviews, pageParams);
  }, [pageParams]);

  const tableColgroup = useMemo(
    () => (
      <colgroup>
        <col style={{ width: "14%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "38%" }} />
        <col style={{ width: "20%" }} />
      </colgroup>
    ),
    []
  );

  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            불러오는 중...
          </TableCell>
        </TableRow>
      );
    }

    if (!serverData.dtoList || serverData.dtoList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center">
            받은 리뷰가 없습니다.
          </TableCell>
        </TableRow>
      );
    }

    return serverData.dtoList.map((item) => (
      <TableRow key={item.reviewNo}>
        <TableCell align="center">{item.cargoType || "-"}</TableCell>
        <TableCell align="center">
          <Rating value={Number(item.rating) || 0} precision={0.5} readOnly />
        </TableCell>
        <TableCell align="center">{item.driverName || "-"}</TableCell>
        <TableCell align="left">
          <Box
            sx={{
              maxWidth: 420,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={item.comment || ""}
          >
            {item.comment || "-"}
          </Box>
        </TableCell>
        <TableCell align="center">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenDetailModal(item)}
          >
            상세
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          내가 받은 리뷰
        </Typography>

        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            차주에게 작성된 리뷰 목록
          </Typography>

          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ height: 470, position: "relative", pb: 0 }}
          >
            <Table sx={{ "& .MuiTableCell-root": { height: 60, py: 0 } }}>
              {tableColgroup}
              <TableHead>
                <TableRow>
                  <TableCell align="center">화물명</TableCell>
                  <TableCell align="center">별점</TableCell>
                  <TableCell align="center">운전 기사</TableCell>
                  <TableCell align="center">리뷰 내용</TableCell>
                  <TableCell align="center">상세</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>{renderRows()}</TableBody>
            </Table>

            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                py: 1.5,
                display: "flex",
                justifyContent: "center",
                bgcolor: "background.paper",
              }}
            >
              <PageComponent serverData={serverData} movePage={movePage} />
            </Box>
          </TableContainer>
        </Box>
      </Container>

      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>받은 리뷰 상세보기</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>화물명:</strong> {selectedDetailReview?.cargoType || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>무게:</strong> {selectedDetailReview?.cargoWeight || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>출발지:</strong> {selectedDetailReview?.startAddress || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>도착지:</strong> {selectedDetailReview?.endAddress || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>배송 완료일:</strong> {formatDateTime(selectedDetailReview?.deliveryCompletedAt)}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>운전 기사:</strong> {selectedDetailReview?.driverName || "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>상태:</strong>{" "}
            {selectedDetailReview?.deliveryStatus === "COMPLETED"
              ? "배송 완료"
              : selectedDetailReview?.deliveryStatus === "IN_TRANSIT"
              ? "배송 중"
              : selectedDetailReview?.deliveryStatus === "PENDING"
              ? "대기"
              : "-"}
          </Typography>

          <Typography gutterBottom>별점</Typography>
          <Rating
            value={Number(selectedDetailReview?.rating) || 0}
            precision={0.5}
            readOnly
          />

          <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
            <strong>작성일:</strong> {formatDateTime(selectedDetailReview?.createdAt)}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={5}
            label="리뷰 내용"
            value={selectedDetailReview?.comment || ""}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetailModal}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceivedReviewInform;