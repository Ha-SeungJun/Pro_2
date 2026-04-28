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
  TableContainer,
  Paper,
  Chip, // Added Chip import
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { fetchMembers } from "../../../api/adminApi/adminMembersApi";
import DeliveryDetailsModal from "./DeliveryDetailsModal"; // Added DeliveryDetailsModal import

const MemberAll = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenModal = (user) => {
    setSelectedUserForModal(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUserForModal(null);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/memberOwner")) setActiveTab(1);
    else if (path.includes("/admin/memberCowner")) setActiveTab(2);
    else if (path.includes("/admin/memberReport")) setActiveTab(3);
    else if (path.includes("/admin/memberAdmin")) setActiveTab(4);
    else setActiveTab(0);
  }, [location.pathname]);

  const handleTabChange = (e, newValue) => {
    if (newValue === 0) navigate("/admin/memberAll");
    else if (newValue === 1) navigate("/admin/memberOwner");
    else if (newValue === 2) navigate("/admin/memberCowner");
    else if (newValue === 3) navigate("/admin/memberReport");
    else if (newValue === 4) navigate("/admin/memberAdmin");
  };

  const fmtDate = (dt) => (dt ? dt.toString().replace("T", " ").slice(0, 16) : "");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMembers({
          type: "ALL",
          page: page - 1,
          size,
          keyword,
          searchType: "name",
        });
        setRows(data.content ?? []);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        console.error(e);
        setError("회원 목록을 불러오지 못했습니다.");
        setRows([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, size, keyword]);

  return (
    <Box flexGrow={1} p={{ xs: 2, md: 4 }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={2}
        mb={2}
      >
        <Box sx={{ width: '100%' }}>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            mb={1}
          >
            <Typography variant="h5" fontWeight="bold">
              회원 관리
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
            variant="scrollable"        // ← 모바일에서 스크롤 가능
            scrollButtons="auto"        // ← 스크롤 버튼 자동
            allowScrollButtonsMobile    // ← 모바일 스크롤 버튼 허용
          >

            <Tab label="전체 회원" component={NavLink} to="/admin/memberAll" />
            <Tab label="물주" component={NavLink} to="/admin/memberOwner" />
            <Tab label="차주" component={NavLink} to="/admin/memberCowner" />
            <Tab label="신고내역" component={NavLink} to="/admin/memberReport" />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>
        <TextField
          variant="outlined"
          placeholder="회원 이름 검색"
          size="small"
          value={keyword}
          onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
          sx={{ width: { xs: '100%', md: 220 } }}  // ← 모바일 전체 너비
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>  {/* ← 가로 스크롤 */}
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell sx={{ display: { sm: 'table-cell' } }}>전화번호</TableCell>
                <TableCell sx={{ display: { sm: 'table-cell' } }}>등록일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.memId ?? i} onClick={() => handleOpenModal(r)} style={{ cursor: 'pointer' }}>
                  <TableCell>{r.memName}</TableCell>
                  <TableCell>{r.memEmail}</TableCell>
                  <TableCell sx={{ display: { sm: 'table-cell' } }}>{r.memPhone}</TableCell>
                  <TableCell sx={{ display: { sm: 'table-cell' } }}>{fmtDate(r.memCreateidDateTime)}</TableCell>
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
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary"
          size="small"  // ← 모바일에서 작게
        />
      </Box>

      <DeliveryDetailsModal open={openModal} onClose={handleCloseModal} selectedUser={selectedUserForModal} />
    </Box>
  );
};

export default MemberAll;