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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PageComponent from "../common/PageComponent";
import {
  getMyReviews,
  deleteReview,
  modifyReview,
} from "../../../api/reviewApi/reviewApi";

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

const MyReviewInform = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [serverData, setServerData] = useState(initState);
  const [pageParams, setPageParams] = useState({ page: 1, size: 5 });
  const [loading, setLoading] = useState(true);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editReviewScore, setEditReviewScore] = useState(0);
  const [editReviewContent, setEditReviewContent] = useState("");

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

  const reloadMyReviews = async () => {
    const data = await getMyReviews();
    const list = Array.isArray(data) ? data : [];
    setAllReviews(list);
    applyPagedData(list);
  };

  const handleOpenEditModal = (item) => {
    setSelectedReview(item);
    setEditReviewScore(Number(item.rating) || 0);
    setEditReviewContent(item.comment || "");
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedReview(null);
    setEditReviewScore(0);
    setEditReviewContent("");
  };

  const handleDelete = async (reviewNo) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteReview(reviewNo);
      alert("삭제 완료");
      await reloadMyReviews();
    } catch (e) {
      console.error("리뷰 삭제 실패:", e);
      alert("삭제 실패");
    }
  };

  const handleConfirmModify = async () => {
    if (!selectedReview) return;

    if (editReviewScore === 0) {
      alert("별점을 선택해야 합니다.");
      return;
    }

    if (!editReviewContent.trim()) {
      alert("리뷰 내용을 입력해야 합니다.");
      return;
    }

    try {
      await modifyReview(selectedReview.reviewNo, {
        deliveryNo: selectedReview.deliveryNo,
        rating: editReviewScore,
        comment: editReviewContent.trim(),
      });

      alert("수정 완료");
      handleCloseEditModal();
      await reloadMyReviews();
    } catch (e) {
      console.error("리뷰 수정 실패:", e);
      alert("수정 실패");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchMyReviews = async () => {
      try {
        setLoading(true);

        const data = await getMyReviews();
        const list = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setAllReviews(list);
          applyPagedData(list, pageParams);
        }
      } catch (error) {
        console.error("내 리뷰 목록 조회 실패:", error);
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

    fetchMyReviews();

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
        <col style={{ width: "10%" }} />
        <col style={{ width: "12%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "34%" }} />
        <col style={{ width: "15%" }} />
        <col style={{ width: "15%" }} />
      </colgroup>
    ),
    []
  );

  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            불러오는 중...
          </TableCell>
        </TableRow>
      );
    }

    if (!serverData.dtoList || serverData.dtoList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            작성한 리뷰가 없습니다.
          </TableCell>
        </TableRow>
      );
    }

    return serverData.dtoList.map((item) => (
      <TableRow key={item.reviewNo}>
        <TableCell align="center">{item.reviewNo}</TableCell>
        <TableCell align="center">{item.deliveryNo}</TableCell>
        <TableCell align="center">
          <Rating value={Number(item.rating) || 0} precision={0.5} readOnly />
        </TableCell>
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
        <TableCell align="center">{formatDateTime(item.createdAt)}</TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleOpenEditModal(item)}
            >
              수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDelete(item.reviewNo)}
            >
              삭제
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          내 리뷰 관리
        </Typography>

        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            내가 작성한 리뷰 목록
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
                  <TableCell align="center">리뷰번호</TableCell>
                  <TableCell align="center">배송번호</TableCell>
                  <TableCell align="center">별점</TableCell>
                  <TableCell align="center">리뷰 내용</TableCell>
                  <TableCell align="center">작성일</TableCell>
                  <TableCell align="center">관리</TableCell>
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

      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>리뷰 수정</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>리뷰번호:</strong> {selectedReview?.reviewNo ?? "-"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>배송번호:</strong> {selectedReview?.deliveryNo ?? "-"}
          </Typography>

          <Typography gutterBottom sx={{ mt: 1 }}>
            별점
          </Typography>

          <Rating
            value={editReviewScore}
            precision={0.5}
            onChange={(event, newValue) => setEditReviewScore(newValue || 0)}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="리뷰 내용"
            value={editReviewContent}
            onChange={(e) => setEditReviewContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditModal}>취소</Button>
          <Button onClick={handleConfirmModify} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReviewInform;