import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  CircularProgress,
  Button,
  Stack,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  fetchReports,
  fetchUnreadCount,
  markReportRead,
  suspendUser,
  unsuspendUser,
} from "../../../api/adminApi/adminReportsApi";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
const MemberReport = () => {
  const [activeTab, setActiveTab] = useState(3);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useEffect(() => {
    if (location.pathname.includes("/admin/memberOwner")) setActiveTab(1);
    else if (location.pathname.includes("/admin/memberCowner")) setActiveTab(2);
    else if (location.pathname.includes("/admin/memberReport")) setActiveTab(3);
    else if (location.pathname.includes("/admin/memberAdmin")) setActiveTab(4);
    else setActiveTab(0);
  }, [location.pathname]);

  const handleTabChange = (e, newValue) => {
    if (newValue === 0) navigate("/admin/memberAll");
    else if (newValue === 1) navigate("/admin/memberOwner");
    else if (newValue === 2) navigate("/admin/memberCowner");
    else if (newValue === 3) navigate("/admin/memberReport");
    else if (newValue === 4) navigate("/admin/memberAdmin");
  };

  const fmtDate = (dt) =>
    dt ? dt.toString().replace("T", " ").slice(0, 16) : "";

  const loadUnreadCount = async () => {
    try {
      const n = await fetchUnreadCount();
      setUnreadCount(n || 0);
    } catch (e) {
      console.warn("unread-count fetch failed", e);
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReports({
        unreadOnly,
        keyword,
        searchType: "name",
        page: page - 1,
        size,
        sort: "createdAt,desc",
      });
      setRows(data.content ?? []);
      setTotalPages(Math.max(data.totalPages || 1, 1));
    } catch (e) {
      console.error(e);
      setError("신고 목록을 불러오지 못했습니다.");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    load();
  }, [page, size, keyword, unreadOnly]);

  // 수정: 신고 상세를 열자마자 자동으로 읽음 처리
  const handleView = async (report) => {
    setSelectedReport(report);
    setDialogOpen(true);

    if (!report.adminRead) {
      try {
        await markReportRead(report.id, true);
        loadUnreadCount();
        load();

        // 수정: 다이얼로그 내부 표시도 바로 "처리됨"으로 바뀌도록 상태 반영
        setSelectedReport((prev) =>
          prev ? { ...prev, adminRead: true } : prev
        );
      } catch (e) {
        console.error("Failed to mark report as read:", e);
      }
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleSuspend = async (period) => {
    if (!selectedReport?.targetId) {
      alert("대상 사용자 ID가 없습니다.");
      return;
    }

    const labelMap = {
      WEEK: "7일 정지",
      MONTH: "30일 정지",
      YEAR: "1년 정지",
      PERMANENT: "영구정지",
    };

    const reason = window.prompt(
      `${selectedReport.targetId} 계정에 대한 ${labelMap[period]} 사유를 입력하세요.`
    );

    if (reason === null) return;
    if (!reason.trim()) {
      alert("정지 사유를 입력해주세요.");
      return;
    }

    try {
      const result = await suspendUser(selectedReport.targetId, period, reason.trim());
      alert(result?.message || `${labelMap[period]} 처리가 완료되었습니다.`);
      handleClose();
      loadUnreadCount();
      load();
    } catch (e) {
      console.error("정지 처리 실패:", e);
      alert(e?.response?.data?.message || "정지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedReport?.targetId) {
      alert("대상 사용자 ID가 없습니다.");
      return;
    }

    const ok = window.confirm(`${selectedReport.targetId} 계정의 정지를 해제하시겠습니까?`);
    if (!ok) return;

    try {
      const result = await unsuspendUser(selectedReport.targetId);
      alert(result?.message || "정지 해제가 완료되었습니다.");
      handleClose();
      loadUnreadCount();
      load();
    } catch (e) {
      console.error("정지 해제 실패:", e);
      alert(e?.response?.data?.message || "정지 해제 중 오류가 발생했습니다.");
    }
  };

  // 수정: 자동 읽음 방식으로 바꾸므로 이 함수는 더 이상 사용하지 않음
  const handleMarkRead = async (id) => {
    if (!id) {
      console.error("신고 ID가 유효하지 않습니다. 신고를 읽음으로 표시할 수 없습니다.");
      alert("신고 ID가 유효하지 않습니다. 신고를 읽음으로 표시할 수 없습니다.");
      return;
    }
    try {
      await markReportRead(id, true);
      loadUnreadCount();
      load();
      setDialogOpen(false);
      window.dispatchEvent(new CustomEvent("reportRead"));
    } catch (e) {
      console.error("신고를 읽음으로 표시하는 데 실패했습니다.", e);
      alert("신고를 읽음으로 표시하는 데 실패했습니다.");
    }
  };

  return (
    <Box flexGrow={1} p={{ xs: 2, md: 4 }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
        mb={2}
      >
        <Box minWidth={0}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mb={1}
          >
            <Typography variant="h5" fontWeight="bold">
              신고내역
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              component={NavLink}
              to="/admin/AdminCargoApproval"
              sx={{ mt: { xs: 1, md: 0 },
    display: { xs: "flex", md: "none" } }}
            >
              차량승인관리
            </Button>
          </Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ maxWidth: '100%' }}
          >
            <Tab label="전체 회원" component={NavLink} to="/admin/memberAll" />
            <Tab label="물주" component={NavLink} to="/admin/memberOwner" />
            <Tab label="차주" component={NavLink} to="/admin/memberCowner" />
            <Tab
              label={`신고내역 ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
              component={NavLink}
              to="/admin/memberReport"
            />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            variant="outlined"
            placeholder="신고대상 이름 검색"
            size="small"
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
            sx={{
              width: { xs: '100%', md: 220 },
              flexShrink: 0,
            }}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
            }}
          />
        </Stack>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>신고대상ID</TableCell>
                <TableCell>신고대상 이름</TableCell>
                <TableCell>신고자</TableCell>
                <TableCell>신고일</TableCell>
                <TableCell>사유</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow
                  key={r.id ?? i}
                  onClick={() => handleView(r)}
                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell>{r.targetId ?? "-"}</TableCell>
                  <TableCell>{r.targetName ?? "-"}</TableCell>
                  <TableCell>{r.reporterId ?? "-"}</TableCell>
                  <TableCell>{fmtDate(r.createdAt)}</TableCell>
                  <TableCell>{r.content ? `${r.content.substring(0, 40)}...` : "-"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.max(totalPages, 1)}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
          size="small"
        />
      </Box>

      {selectedReport && (
        <Dialog
          open={dialogOpen}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          fullScreen={isMobile}
        >
          <DialogTitle>신고 상세 정보</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom><b>신고대상:</b> {selectedReport.targetId ?? "-"}</Typography>
            <Typography gutterBottom><b>신고대상 이름:</b> {selectedReport.targetName ?? "-"}</Typography>
            <Typography gutterBottom><b>신고자:</b> {selectedReport.reporterId ?? "-"}</Typography>
            <Typography gutterBottom><b>신고일:</b> {fmtDate(selectedReport.createdAt)}</Typography>
            <Typography gutterBottom><b>처리 상태:</b> {selectedReport.adminRead ? "처리됨" : "미확인"}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>신고 사유:</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1, whiteSpace: "pre-wrap", minHeight: "100px" }}>
              {selectedReport.content ?? "-"}
            </Paper>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}
          >
            <Button onClick={handleClose}>닫기</Button>
            <Button onClick={() => handleSuspend("WEEK")} color="warning" variant="outlined">
              7일 정지
            </Button>
            <Button onClick={() => handleSuspend("MONTH")} color="warning" variant="outlined">
              30일 정지
            </Button>
            <Button onClick={() => handleSuspend("YEAR")} color="warning" variant="outlined">
              1년 정지
            </Button>
            <Button onClick={() => handleSuspend("PERMANENT")} color="error" variant="contained">
              영구정지
            </Button>
            <Button onClick={handleUnsuspend} color="success" variant="text">
              정지 해제
            </Button>
          </DialogActions>
        </Dialog>
      )
      }
    </Box >
  );
};

export default MemberReport;