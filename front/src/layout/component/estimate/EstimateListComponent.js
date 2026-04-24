import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import useCustomMove from "../../../hooks/useCustomMove";
import { useEffect, useState } from "react";
import { getEstimateList, postAccepted, postRejected } from "../../../api/estimateApi/estimateApi";
import PageComponent from "../common/PageComponent";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  tatalPage: 0,
  current: 0
};

const EstimateListComponent = () => {
  const { page, size, moveToList, refresh, setRefresh } = useCustomMove();
  const [serverData, setServerData] = useState(initState);
  const navigate = useNavigate();
  const { roles, email } = useSelector(state => state.login);

  const [openEstimateListAccept, setOpenEstimateListAccept] = useState(false);
  const [selectedEno, setSelectedEno] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const safeRoles = Array.isArray(roles) ? roles : [];

  const isDriver = safeRoles.includes("ROLE_DRIVER");
  const isShipper = safeRoles.includes("ROLE_SHIPPER");
  const isAdmin = safeRoles.includes("ROLE_ADMIN"); // 수정: 관리자도 운송 접수 목록 접근 허용

  const canAcceptOrReject = isDriver; // 수정: 수락/거절 버튼은 차주만 표시

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      const token = sessionStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/", { replace: true });
        return;
      }

      if (!email && roles.length === 0) return;

      // 수정: 차주, 화주, 관리자 모두 접근 가능
      if (!isDriver && !isShipper && !isAdmin) {
        if (!ignore) setServerData(initState);
        return;
      }

      try {
        const data = await getEstimateList({ page, size });
        if (!ignore) setServerData(data);
      } catch (err) {
        const status = err?.response?.status;
        const backend = err?.response?.data;
        const msg =
          backend?.message ||
          backend?.error ||
          (typeof backend === "string" ? backend : null) ||
          "목록을 불러오는 중 오류가 발생했습니다.";

        if (status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/", { replace: true });
        } else if (status === 403) {
          alert("권한이 없습니다.");
          navigate("/", { replace: true });
        } else {
          alert(`[${status ?? "ERR"}] ${msg}`);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [
    page,
    size,
    refresh,
    navigate,
    roles,
    email,
    isDriver,
    isShipper,
    isAdmin // 수정: 관리자 권한 의존성 추가
  ]);

  const handleCancelClose = () => {
    setOpenEstimateListAccept(false);
    setSelectedEno(null);
  };

  const clickRejected = (esNo) => {
    postRejected(esNo).then(() => {
      setRefresh(!refresh);
    });
  };

  const clickAccepted = (enNo) => {
    setOpenEstimateListAccept(true);
    setSelectedEno(enNo);
  };

  const handleClickFinalCheck = async () => {
    if (!selectedEno || accepting) return;

    try {
      setAccepting(true);
      await postAccepted(selectedEno);
      alert("견적이 수락되었습니다");
      setOpenEstimateListAccept(false);
      setSelectedEno(null);
      setRefresh(!refresh);
    } catch (e) {
      if (e.response && typeof e.response.data === "string") {
        alert(e.response.data);
      } else {
        alert("수락 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setAccepting(false);
      setOpenEstimateListAccept(false);
    }
  };

  const renderData = (list) => {
    if (!list || list.length === 0) {
      return (
        <TableRow>
          {/* 수정: 차주만 수락/거절 컬럼 포함 */}
          <TableCell colSpan={canAcceptOrReject ? 9 : 7} align="center">
            견적의뢰가 없습니다
          </TableCell>
        </TableRow>
      );
    }

    return list.map((estimate) => (
      <TableRow key={estimate.eno}>
        <TableCell align="center">No.{estimate.eno}</TableCell>
        <TableCell align="center">{estimate.route}</TableCell>
        <TableCell align="center">{estimate.distanceKm}</TableCell>
        <TableCell align="center">{estimate.cargoWeight}</TableCell>
        <TableCell align="center">
          {dayjs(estimate.startTime).format("YYYY년 MM월 DD일 A hh:mm")}
        </TableCell>
        <TableCell align="center">{estimate.cargoType}</TableCell>
        <TableCell align="center">{estimate.totalCost}</TableCell>

        {/* 수정: 차주만 수락/거절 버튼 표시, 화주/관리자는 숨김 */}
        {canAcceptOrReject && (
          <>
            <TableCell align="center">
              <Button
                variant="contained"
                color="success"
                onClick={() => clickAccepted(estimate.eno)}
              >
                수락
              </Button>
            </TableCell>
            <TableCell align="center">
              <Button
                variant="outlined"
                color="error"
                onClick={() => clickRejected(estimate.eno)}
              >
                거절
              </Button>
            </TableCell>
          </>
        )}
      </TableRow>
    ));
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#EEE0F8" }}>
            <TableRow>
              <TableCell align="center">견적번호</TableCell>
              <TableCell align="center">출발 - 도착</TableCell>
              <TableCell align="center">거리(KM)</TableCell>
              <TableCell align="center">무게(KG)</TableCell>
              <TableCell align="center">출발 날짜</TableCell>
              <TableCell align="center">화물 종류</TableCell>
              <TableCell align="center">금액</TableCell>

              {/* 수정: 차주만 수락/거절 헤더 표시 */}
              {canAcceptOrReject && (
                <>
                  <TableCell align="center">수락</TableCell>
                  <TableCell align="center">거절</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {renderData(serverData.dtoList)}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center" gap={1} sx={{ paddingBottom: 5 }}>
        <PageComponent serverData={serverData} movePage={moveToList} />
      </Box>

      <Dialog
        open={openEstimateListAccept}
        onClose={handleCancelClose}
        PaperProps={{ sx: { width: 400, height: 150, borderRadius: 2, p: 2 } }}
      >
        <DialogContent>
          <Typography fontSize={20} fontWeight="bold">
            해당 견적을 수락하시겠습니까?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClickFinalCheck} color="error" disabled={accepting}>
            확인
          </Button>
          <Button onClick={handleCancelClose} color="inherit">
            아니요
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EstimateListComponent;