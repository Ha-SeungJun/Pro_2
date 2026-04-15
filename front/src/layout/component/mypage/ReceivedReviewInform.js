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
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";
import * as PortOne from "@portone/browser-sdk/v2";
import PageComponent from "../common/PageComponent";
import { getReceivedReviews } from "../../../api/reviewApi/reviewApi";
import { getMyReceivedReviewSummary } from "../../../api/reviewApi/reviewApi";
import { getMyVerificationStatus, startVerification, confirmVerification } from "../../../api/verificationApi/verificationApi";
import DriverProfileCard from "../common/DriverProfileCard";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

const DEFAULT_AVATAR = "/image/placeholders/avatar.svg";

const getFirst = (...candidates) =>
  candidates.find((v) => v !== undefined && v !== null && v !== "") ?? "";

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith("http")) return v;
  if (v.startsWith("/g2i4/uploads/")) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

const ratingRows = [
  { key: "five", value: 5, label: "5점" },
  { key: "four", value: 4, label: "4점" },
  { key: "three", value: 3, label: "3점" },
  { key: "two", value: 2, label: "2점" },
  { key: "one", value: 1, label: "1점" },
];
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

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedDetailReview, setSelectedDetailReview] = useState(null);
  const [sortType, setSortType] = useState("latest");

  const [profileInfo, setProfileInfo] = useState({
    id: "",
    name: "",
    avatarUrl: null,
  });
  const [verification, setVerification] = useState({
    isVerified: false,
    verifiedAt: null,
    verifiedPhone: null,
  });
  const [loading, setLoading] = useState(false);
  const sortReviews = (list, sortType) => {
    const copied = [...list];

    switch (sortType) {
      case "ratingDesc":
        return copied.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      case "ratingAsc":
        return copied.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
      case "oldest":
        return copied.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "latest":
      default:
        return copied.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };
  const movePage = (pageObj) => {
    setPageParams((prev) => ({ ...prev, ...pageObj }));
  };
  const [summary, setSummary] = useState({
    cargoId: "",
    avgRating: 0,
    reviewCount: 0,
  });

  const fetchVerificationStatus = async () => {
    try {
      const data = await getMyVerificationStatus();

      setVerification({
        isVerified: Boolean(data?.isVerified),
        verifiedAt: data?.verifiedAt ?? null,
        verifiedPhone: data?.verifiedPhone ?? null,
      });
    } catch (error) {
      console.error("본인인증 상태 조회 실패:", error);
    }
  };
  const handleVerificationClick = async () => {
    if (verification.isVerified) return;

    setLoading(true);

    try {
      const data = await startVerification();

      const response = await PortOne.requestIdentityVerification({
        storeId: data.storeId,
        identityVerificationId: data.identityVerificationId,
        channelKey: data.channelKey,
        redirectUrl: data.redirectUrl,
      });

      // 실패 응답
      if (response?.code !== undefined) {
        alert(response.message || "본인인증에 실패했습니다.");
        return;
      }

      // 인증 완료 확인
      await confirmVerification({
        identityVerificationId: data.identityVerificationId,
      });

      // 여기 추가: 서버에서 최신 상태 다시 읽기
      await fetchVerificationStatus();

      alert("본인인증이 완료되었습니다.");
    } catch (error) {
      console.error("본인인증 시작 실패:", error);
      alert("본인인증 시작에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      try {
        const data = await getMyReceivedReviewSummary();

        if (!cancelled) {
          setSummary({
            cargoId: data?.cargoId ?? "",
            avgRating: Number(data?.avgRating ?? 0),
            reviewCount: Number(data?.reviewCount ?? 0),
          });
        }
      } catch (error) {
        console.error("받은 리뷰 요약 조회 실패:", error);
        if (!cancelled) {
          setSummary({
            cargoId: "",
            avgRating: 0,
            reviewCount: 0,
          });
        }
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchVerification = async () => {
      try {
        const data = await getMyVerificationStatus();

        if (!cancelled) {
          setVerification({
            isVerified: Boolean(data?.isVerified),
            verifiedAt: data?.verifiedAt ?? null,
            verifiedPhone: data?.verifiedPhone ?? null,
          });
        }
      } catch (error) {
        console.error("본인인증 상태 조회 실패:", error);
        if (!cancelled) {
          setVerification({
            isVerified: false,
            verifiedAt: null,
            verifiedPhone: null,
          });
        }
      }
    };

    fetchVerification();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchUserInfo = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");

        const res = await fetch(`${API_BASE}/g2i4/user/info`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const raw = await res.json();

        const data =
          raw?.data ||
          raw?.user ||
          raw?.payload ||
          raw?.profile ||
          raw?.account ||
          raw?.result ||
          raw ||
          {};

        const id = getFirst(data.cargo_id, data.cargoId, data.id, data.username);
        const name = getFirst(data.cargo_name, data.cargoName, data.name);
        const avatarName = getFirst(
          data.webPath,
          data.profileImage,
          data.cargo_profile_image,
          data.profile
        );

        const avatarUrl = normalizeProfileUrl(avatarName);

        if (!cancelled) {
          setProfileInfo({
            id: id || "",
            name: name || "",
            avatarUrl: avatarUrl || null,
          });
        }
      } catch (error) {
        console.error("프로필 정보 조회 실패:", error);
      }
    };

    fetchUserInfo();

    return () => {
      cancelled = true;
    };
  }, []);
  const applyPagedData = (list, nextPageParams = pageParams, nextSortType = sortType) => {
    const sorted = sortReviews(list, nextSortType);
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
    applyPagedData(allReviews, pageParams, sortType);
  }, [pageParams, sortType, allReviews]);

  const tableColgroup = useMemo(
    () => (
      <colgroup>
        <col style={{ width: "18%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "28%" }} />
        <col style={{ width: "14%" }} />
        <col style={{ width: "10%" }} />
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
        <TableCell align="center">{item.writerId || "-"}</TableCell>
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
        <TableCell align="center">
          {formatDateTime(item.createdAt)}
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
  const reviewStats = useMemo(() => {
    const stats = {
      total: allReviews.length,
      avg: 0,
      five: 0,
      four: 0,
      three: 0,
      two: 0,
      one: 0,
    };

    if (allReviews.length === 0) return stats;

    let sum = 0;

    allReviews.forEach((item) => {
      const rating = Number(item.rating) || 0;
      sum += rating;

      if (rating >= 5) stats.five += 1;
      else if (rating >= 4) stats.four += 1;
      else if (rating >= 3) stats.three += 1;
      else if (rating >= 2) stats.two += 1;
      else stats.one += 1;
    });

    stats.avg = sum / allReviews.length;
    return stats;
  }, [allReviews]);
  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          내가 받은 리뷰
        </Typography>

        
        <Box sx={{ mb: 4 }}>
          <DriverProfileCard
            title="프로필"
            profileInfo={profileInfo}
            summary={summary}
            verification={verification}
            reviewStats={reviewStats}
            showVerifyButton={true}
            verifyButtonLoading={loading}
            onVerifyClick={handleVerificationClick}
          />
        </Box>
        <Box mt={6}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>

          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              차주에게 작성된 리뷰 목록
            </Typography>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortType}
                label="정렬"
                onChange={(e) => setSortType(e.target.value)}
              >
                <MenuItem value="latest">최신 순</MenuItem>
                <MenuItem value="oldest">오래된 순</MenuItem>
                <MenuItem value="ratingDesc">별점 높은 순</MenuItem>
                <MenuItem value="ratingAsc">별점 낮은 순</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
                  <TableCell align="center">작성자</TableCell>
                  <TableCell align="center">별점</TableCell>
                  <TableCell align="center">리뷰 내용</TableCell>
                  <TableCell align="center">작성일</TableCell>
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
            <strong>작성자:</strong> {selectedDetailReview?.writerId || "-"}
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