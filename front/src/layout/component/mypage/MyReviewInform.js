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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DriverProfileCard from "../common/DriverProfileCard.js";
import PageComponent from "../common/PageComponent";
import {
  getMyReviewsWithDriverId,
  getDriverDetail,
  deleteReview,
  modifyReview,
  getReviewByReviewNo,
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
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedDetailReview, setSelectedDetailReview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDriverDetailModal, setOpenDriverDetailModal] = useState(false);
  const [selectedDriverDetail, setSelectedDriverDetail] = useState(null);
  const [driverReviewSortType, setDriverReviewSortType] = useState("latest");
  const [driverReviewPage, setDriverReviewPage] = useState(1);
  const DRIVER_REVIEW_PAGE_SIZE = 3;
  const [editReviewImages, setEditReviewImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [newEditImages, setNewEditImages] = useState([]);

  const handleOpenDriverDetailModal = async (item) => {
    if (!item?.driverId) {
      alert("차주 식별 정보가 없습니다.");
      return;
    }

    try {
      const data = await getDriverDetail(item.driverId);
      console.log("차주 상세 응답:", data);
      setSelectedDriverDetail(data);
      setDriverReviewSortType("latest");
      setDriverReviewPage(1);
      setOpenDriverDetailModal(true);
    } catch (error) {
      console.error("차주 상세 조회 실패:", error);
      alert("차주 상세 정보를 불러오지 못했습니다.");
    }
  };
  const handleCloseDriverDetailModal = () => {
    setOpenDriverDetailModal(false);
    setSelectedDriverDetail(null);
    setDriverReviewPage(1);
  };

  const handleOpenDetailModal = async (item) => {
    console.log("상세 버튼 item 전체:", item);
    console.log("item.reviewNo:", item?.reviewNo);
    console.log("item.deliveryNo:", item?.deliveryNo);

    if (!item?.deliveryNo) {
      alert("deliveryNo 값이 없습니다.");
      return;
    }

    try {
      const detail = await getReviewByReviewNo(item.reviewNo);

      console.log("상세 review detail:", detail);

      setSelectedDetailReview({
        ...item,
        ...detail,
      });
      setOpenDetailModal(true);
    } catch (error) {
      console.error("리뷰 상세 조회 실패:", error);
      console.error("응답 데이터:", error?.response?.data);
      console.error("응답 상태:", error?.response?.status);
      alert("리뷰 상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedDetailReview(null);
  };
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
    const data = await getMyReviewsWithDriverId();
    const list = Array.isArray(data) ? data : [];
    setAllReviews(list);
    applyPagedData(list);
  };

  const handleOpenEditModal = async (item) => {
    const detail = await getReviewByReviewNo(item.reviewNo);
    const merged = { ...item, ...detail };

    setSelectedReview(merged);
    setEditReviewScore(Number(merged.rating) || 0);
    setEditReviewContent(merged.comment || "");
    setEditReviewImages(merged.images || []);
    setDeleteImageIds([]);
    setNewEditImages([]);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedReview(null);
    setEditReviewScore(0);
    setEditReviewContent("");
    setEditReviewImages([]);
    setDeleteImageIds([]);
    setNewEditImages([]);
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
      const formData = new FormData();
      formData.append("rating", editReviewScore);
      formData.append("comment", editReviewContent.trim());

      deleteImageIds.forEach((id) => {
        formData.append("deleteImageIds", id);
      });

      newEditImages.forEach((file) => {
        formData.append("newImages", file);
      });

      await modifyReview(selectedReview.reviewNo, formData);

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

        const data = await getMyReviewsWithDriverId();
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
        <col style={{ width: "8%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "12%" }} />
        <col style={{ width: "12%" }} />
        <col style={{ width: "10%" }} />   {/* 썸네일 */}
        <col style={{ width: "22%" }} />
        <col style={{ width: "11%" }} />
        <col style={{ width: "15%" }} />
      </colgroup>
    ),
    []
  );

  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
            불러오는 중...
          </TableCell>
        </TableRow>
      );
    }

    if (!serverData.dtoList || serverData.dtoList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center">
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
          <Button
            variant="text"
            size="small"
            onClick={() => handleOpenDriverDetailModal(item)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              minWidth: "auto",
              p: 0,
            }}
          >
            {item.driverName || "-"}
          </Button>
        </TableCell>

        <TableCell align="center">
          <Rating value={Number(item.rating) || 0} precision={0.5} readOnly />
        </TableCell>
        <TableCell align="center">
          {item.images?.length > 0 ? (
            <img
              src={`http://localhost:8080/${item.images[0].imagePath}`}
              alt="thumbnail"
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
          ) : (
            "-"
          )}
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
              onClick={() => handleOpenDetailModal(item)}
            >
              상세
            </Button>

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
  const selectedDriverProfileInfo = {
    id: selectedDriverDetail?.profile?.driverId || "",
    name: selectedDriverDetail?.profile?.driverName || "운전기사",
    avatarUrl: selectedDriverDetail?.profile?.driverProfileImage || null,
  };

  const selectedDriverSummary = {
    avgRating: Number(selectedDriverDetail?.profile?.avgRating || 0),
    reviewCount: Number(selectedDriverDetail?.profile?.reviewCount || 0),
  };

  const selectedDriverVerification = {
    isVerified: Boolean(selectedDriverDetail?.profile?.isVerified),
  };
  const selectedDriverReviewStats = useMemo(() => {
    const reviews = Array.isArray(selectedDriverDetail?.reviews)
      ? selectedDriverDetail.reviews
      : [];

    const stats = {
      total: reviews.length,
      five: 0,
      four: 0,
      three: 0,
      two: 0,
      one: 0,
    };

    reviews.forEach((item) => {
      const rating = Number(item.rating) || 0;

      if (rating >= 5) stats.five += 1;
      else if (rating >= 4) stats.four += 1;
      else if (rating >= 3) stats.three += 1;
      else if (rating >= 2) stats.two += 1;
      else stats.one += 1;
    });

    return stats;
  }, [selectedDriverDetail]);

  const sortedDriverReviews = useMemo(() => {
    const reviews = Array.isArray(selectedDriverDetail?.reviews)
      ? [...selectedDriverDetail.reviews]
      : [];

    switch (driverReviewSortType) {
      case "ratingDesc":
        return reviews.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      case "ratingAsc":
        return reviews.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
      case "oldest":
        return reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "latest":
      default:
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [selectedDriverDetail, driverReviewSortType]);
  const driverReviewTotalPage = Math.max(
    1,
    Math.ceil(sortedDriverReviews.length / DRIVER_REVIEW_PAGE_SIZE)
  );

  const pagedDriverReviews = useMemo(() => {
    const startIndex = (driverReviewPage - 1) * DRIVER_REVIEW_PAGE_SIZE;
    const endIndex = startIndex + DRIVER_REVIEW_PAGE_SIZE;
    return sortedDriverReviews.slice(startIndex, endIndex);
  }, [sortedDriverReviews, driverReviewPage]);

  useEffect(() => {
    if (driverReviewPage > driverReviewTotalPage) {
      setDriverReviewPage(driverReviewTotalPage);
    }
  }, [driverReviewPage, driverReviewTotalPage]);
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
                  <TableCell align="center">운전기사</TableCell>
                  <TableCell align="center">별점</TableCell>
                  <TableCell align="center">사진</TableCell>
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              기존 이미지
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {editReviewImages.map((img) => {
                const imageId = img.reviewImageNo;
                const checked = deleteImageIds.includes(imageId);

                return (
                  <Box key={imageId} sx={{ textAlign: "center" }}>
                    <img
                      src={`http://localhost:8080/${img.imagePath}`}
                      alt={`review-${imageId}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: checked ? "2px solid red" : "1px solid #ddd",
                        opacity: checked ? 0.5 : 1,
                      }}
                    />

                    <Button
                      size="small"
                      color={checked ? "success" : "error"}
                      onClick={() => {
                        setDeleteImageIds((prev) =>
                          checked
                            ? prev.filter((id) => id !== imageId)
                            : [...prev, imageId]
                        );
                      }}
                    >
                      {checked ? "복원" : "삭제"}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              새 이미지 추가
            </Typography>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewEditImages(files);
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditModal}>취소</Button>
          <Button onClick={handleConfirmModify} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>리뷰 상세보기</DialogTitle>

        <DialogContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            리뷰 대상 배송 정보
          </Typography>

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

          <Typography variant="body2" sx={{ mb: 3 }}>
            <strong>상태:</strong>{" "}
            {selectedDetailReview?.deliveryStatus === "COMPLETED"
              ? "배송 완료"
              : selectedDetailReview?.deliveryStatus === "IN_TRANSIT"
                ? "배송 중"
                : selectedDetailReview?.deliveryStatus === "PENDING"
                  ? "대기"
                  : "-"}
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            리뷰 정보
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
          {selectedDetailReview?.images?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                첨부 사진
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedDetailReview.images.map((img) => (
                  <img
                    key={img.reviewImageNo}
                    src={`http://localhost:8080/${img.imagePath}`}
                    alt={`review-${img.reviewImageNo}`}
                    onClick={() => setSelectedImage(img.imagePath)}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
            </Box>

          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>닫기</Button>
        </DialogActions>

      </Dialog>
      <Dialog
        open={openDriverDetailModal}
        onClose={handleCloseDriverDetailModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>운전기사 상세 정보</DialogTitle>

        <DialogContent>
          <DriverProfileCard
            title="운전기사 프로필"
            profileInfo={selectedDriverProfileInfo}
            summary={selectedDriverSummary}
            verification={selectedDriverVerification}
            reviewStats={selectedDriverReviewStats}
            showVerifyButton={false}
          />

          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                차주에게 작성된 리뷰 목록
              </Typography>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>정렬</InputLabel>
                <Select
                  value={driverReviewSortType}
                  label="정렬"
                  onChange={(e) => {
                    setDriverReviewSortType(e.target.value);
                    setDriverReviewPage(1);
                  }}
                >
                  <MenuItem value="latest">최신 순</MenuItem>
                  <MenuItem value="oldest">오래된 순</MenuItem>
                  <MenuItem value="ratingDesc">별점 높은 순</MenuItem>
                  <MenuItem value="ratingAsc">별점 낮은 순</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {pagedDriverReviews.length ? (
              <Stack spacing={2}>
                {pagedDriverReviews.map((review) => (
                  <Box
                    key={review.reviewNo}
                    sx={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      p: 2,
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        작성자: {review.writerId || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(review.createdAt)}
                      </Typography>
                    </Box>

                    <Rating
                      value={Number(review.rating) || 0}
                      precision={0.5}
                      readOnly
                      sx={{ mb: 1 }}
                    />

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>화물명:</strong> {review.cargoType || "-"}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>리뷰 내용:</strong> {review.comment || "-"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                등록된 리뷰가 없습니다.
              </Typography>
            )}
            {pagedDriverReviews.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  disabled={driverReviewPage <= 1}
                  onClick={() => setDriverReviewPage((prev) => prev - 1)}
                >
                  이전
                </Button>

                <Typography variant="body2">
                  {driverReviewPage} / {driverReviewTotalPage}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  disabled={driverReviewPage >= driverReviewTotalPage}
                  onClick={() => setDriverReviewPage((prev) => prev + 1)}
                >
                  다음
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDriverDetailModal}>닫기</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>이미지 보기</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {selectedImage && (
            <img
              src={`http://localhost:8080/${selectedImage}`}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>

  );
};

export default MyReviewInform;