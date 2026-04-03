import React, { useState, useEffect, useMemo } from "react";
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
  Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { API_SERVER_HOST } from "../../../api/serverConfig";

const PREFIX = `${API_SERVER_HOST}/g2i4/admin/members`;

const MemberAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
  const [activeTab, setActiveTab] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(1);

  const sort = useMemo(() => "memCreateidDateTime,desc", []);

  useEffect(() => {
    if (location.pathname.includes("/admin/memberOwner")) setActiveTab(1);
    else if (location.pathname.includes("/admin/memberCowner")) setActiveTab(2);
    else if (location.pathname.includes("/admin/memberReport")) setActiveTab(3);
    else if (location.pathname.includes("/admin/memberAdmin")) setActiveTab(4);
    else setActiveTab(0); // Default to "전체 회원"
  }, [location.pathname]);

  const handleTabChange = (_e, newValue) => {
    setCurrentPage(1);
    if (newValue === 0) navigate("/admin/memberAll");
    else if (newValue === 1) navigate("/admin/memberOwner");
    else if (newValue === 2) navigate("/admin/memberCowner");
    else if (newValue === 3) navigate("/admin/memberReport");
    else if (newValue === 4) navigate("/admin/memberAdmin");
  };

  const handlePageChange = (_e, value) => setCurrentPage(value);
  const handleSearchChange = (e) => setSearchKeyword(e.target.value);

  

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params = {
          type: "ADMIN",
          page: currentPage - 1,
          size: 10,
          sort,
        };
        if (searchKeyword && searchKeyword.trim()) {
          params.keyword = searchKeyword.trim();
        }

        const res = await axios.get(PREFIX, { params });
        const { content = [], totalPages = 1 } = res.data ?? {};
        setUsers(
          content.map((u) => ({
            name: u.memName ?? "",
            adminId: u.memId ?? "",
            phone: u.memPhone ?? "",
            createdAt: (u.memCreateidDateTime ?? "").toString().replace("T", " ").slice(0, 16),
          }))
        );
        setTotalPages(Math.max(totalPages, 1));
      } catch (err) {
        console.error("[ADMIN LIST] load failed", err?.response?.status, err?.response?.data || err.message);
        setUsers([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [currentPage, searchKeyword, sort]);

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
          placeholder="Search"
          size="small"
          value={searchKeyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>관리자ID</TableCell>
                <TableCell>전화번호</TableCell>
                <TableCell>등록일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.adminId}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
      </Box>
    </Box>
  );
};

export default MemberAdmin;
