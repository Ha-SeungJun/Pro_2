import React, { useState, useEffect } from 'react';
import { getNoticeDetail, getNotices, createNotice } from '../../../api/noticeApi';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation, NavLink } from 'react-router-dom';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedNotice, setSelectedNotice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const fetchNotices = () => {
    getNotices({ page: page, size: 10, keyword: searchKeyword }).then(data => {
      setNotices(data.content);
      setTotalPages(data.totalPages);
    }).catch(error => {
      console.error("Error fetching notices:", error);
    });
  };

  useEffect(() => {
    fetchNotices();
  }, [page, searchKeyword, location.pathname]);

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleSearchChange = (e) => setSearchKeyword(e.target.value);

  const handleView = (noticeId) => {
    setLoading(true);
    getNoticeDetail(noticeId).then(data => {
      setSelectedNotice(data);
      setOpen(true);
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching notice detail:", error);
      alert("공지사항을 불러오는 데 실패했습니다.");
      setLoading(false);
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNotice(null);
  };
  const handleWriteClose = () => {
    setWriteOpen(false);
    setNoticeTitle("");
    setNoticeContent("");
  };

  const handleCreateNotice = async () => {
    if (!noticeTitle.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    if (!noticeContent.trim()) {
      alert("내용을 입력하세요.");
      return;
    }

    try {
      await createNotice({
        title: noticeTitle,
        content: noticeContent,
      });

      alert("공지사항이 등록되었습니다.");
      handleWriteClose();
      setPage(0);
      fetchNotices();
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("공지사항 등록에 실패했습니다.");
    }
  };
  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>

        {/* 왼쪽 영역 */}
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={1}>
            공지/문의
          </Typography>
          <Tabs value={location.pathname} onChange={handleTabChange}>
            <Tab label="공지사항" value="/admin/notice" component={NavLink} to="/admin/notice" />
            <Tab label="문의사항" value="/admin/inquirie" component={NavLink} to="/admin/inquirie" />
          </Tabs>
        </Box>

        {/* 오른쪽 영역 */}
        <Box display="flex" gap={2} alignItems="center">

          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            value={searchKeyword}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
          />

          <Button
            variant="contained"
            onClick={() => setWriteOpen(true)}
          >
            공지사항 작성
          </Button>

        </Box>

      </Box>
              <TextField
          variant="outlined"
          placeholder="검색"
          size="small"
          value={searchKeyword}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
          }}
        />
      <TableContainer component={Paper} sx={{mt:2}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>작성자</TableCell>
              <TableCell>작성일</TableCell>
              <TableCell>조회수</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notices.map((notice) => (
              <TableRow
                key={notice.noticeId}
                onClick={() => handleView(notice.noticeId)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>
                  {notice.title}
                </TableCell>
                <TableCell>{notice.authorName}</TableCell>
                <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{notice.viewCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {selectedNotice && (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedNotice.title}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                작성자: {selectedNotice.authorName} | 작성일: {new Date(selectedNotice.createdAt).toLocaleString()} | 조회수: {selectedNotice.viewCount}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedNotice.content}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>닫기</Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog open={writeOpen} onClose={handleWriteClose} fullWidth maxWidth="md">
        <DialogTitle>공지사항 작성</DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            label="제목"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={8}
            label="내용"
            value={noticeContent}
            onChange={(e) => setNoticeContent(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleWriteClose}>취소</Button>
          <Button variant="contained" onClick={handleCreateNotice}>
            등록
          </Button>
        </DialogActions>
      </Dialog>
      {loading && (
        <Dialog open={loading}>
          <DialogContent>
            <CircularProgress />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default Notice;
