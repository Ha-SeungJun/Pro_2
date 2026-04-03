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
  Switch,
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
} from "../../../api/adminApi/adminReportsApi";

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
      setRows([]); setTotalPages(1);
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

  const handleView = async (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
    if (!report.adminRead) {
      try {
        await markReportRead(report.id, true);
        loadUnreadCount();
        load();
      } catch (e) {
        console.error("Failed to mark report as read:", e);
      }
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleSanction = () => {
    if (!selectedReport) return;
    if (window.confirm(`정말로 ${selectedReport.targetId} 회원을 탈퇴 처리하시겠습니까?`)) {
        alert("회원탈퇴 기능은 아직 준비되지 않았습니다.");
    }
  };

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
      window.dispatchEvent(new CustomEvent('reportRead')); // Dispatch custom event
    } catch (e) {
      console.error("신고를 읽음으로 표시하는 데 실패했습니다.", e);
      alert("신고를 읽음으로 표시하는 데 실패했습니다.");
    }
  };

  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            회원 관리
          </Typography>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="전체 회원" component={NavLink} to="/admin/memberAll" />
            <Tab label="물주" component={NavLink} to="/admin/memberOwner" />
            <Tab label="차주" component={NavLink} to="/admin/memberCowner" />
            <Tab label={`신고내역 ${unreadCount > 0 ? `(${unreadCount})` : ''}`} component={NavLink} to="/admin/memberReport" />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          

          <TextField
            variant="outlined"
            placeholder="신고대상 이름 검색"
            size="small"
            value={keyword}
            onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
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
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }}>
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
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
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
                  <TableCell colSpan={4} align="center">데이터가 없습니다.</TableCell>
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
        />
      </Box>

      {selectedReport && (
        <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>신고 상세 정보</DialogTitle>
          <DialogContent dividers>
              <Typography gutterBottom><b>신고대상:</b> {selectedReport.targetId ?? "-"}</Typography>
              <Typography gutterBottom><b>신고자:</b> {selectedReport.reporterId ?? "-"}</Typography>
              <Typography gutterBottom><b>신고일:</b> {fmtDate(selectedReport.createdAt)}</Typography>
              <Typography gutterBottom><b>처리 상태:</b> {selectedReport.adminRead ? '처리됨' : '미확인'}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>신고 사유:</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                  {selectedReport.content ?? "-"}
              </Paper>
          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose}>닫기</Button>
              {!selectedReport?.adminRead && ( // Only show if not already read
                <Button onClick={() => handleMarkRead(selectedReport.id)} color="primary" variant="contained">관리자 확인</Button>
              )}
              <Button onClick={handleSanction} color="error" variant="contained">회원탈퇴 처리</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MemberReport;
