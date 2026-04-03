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
  Chip // Added Chip import
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
            <Tab label="신고내역" component={NavLink} to="/admin/memberReport" />
            <Tab label="관리자" component={NavLink} to="/admin/memberAdmin" />
          </Tabs>
        </Box>
        <TextField
          variant="outlined"
          placeholder="회원 이름 검색"
          size="small"
          value={keyword}
          onChange={(e) => {
            setPage(1);
            setKeyword(e.target.value);
          }}
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
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>등록일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.memId ?? i} onClick={() => handleOpenModal(r)} style={{ cursor: 'pointer' }}>
                  <TableCell>{r.memName}</TableCell>
                  <TableCell>{r.memEmail}</TableCell>
                  <TableCell>{r.memPhone}</TableCell>
                  <TableCell>{fmtDate(r.memCreateidDateTime)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">데이터가 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
        />
      </Box>
      <DeliveryDetailsModal
        open={openModal}
        onClose={handleCloseModal}
        selectedUser={selectedUserForModal}
      />
    </Box>
  );
};

export default MemberAll;