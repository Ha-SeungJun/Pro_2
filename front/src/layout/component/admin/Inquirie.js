import React, { useState, useEffect } from "react";
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
    Chip,
    Pagination,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TableContainer,
    Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getPostList, getPostDetail } from "../../../api/qaboardApi";
import { useNavigate, useLocation, NavLink } from "react-router-dom";

const Inquirie = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedPost, setSelectedPost] = useState(null);
    const [open, setOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        navigate(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (e, value) => setCurrentPage(value);

    const handleSearchChange = (e) => setSearchKeyword(e.target.value);

    const fetchInquiries = async () => {
        if (location.pathname === '/admin/inquirie') {
            setIsLoading(true);
            try {
                const response = await getPostList({ page: currentPage - 1, size: 10, keyword: searchKeyword }, {}, true);
                setPosts(response.content);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Failed to fetch inquiries:", error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [currentPage, location.pathname, searchKeyword]);

    const handleView = (postId) => {
        setDetailLoading(true);
        getPostDetail(postId).then(data => {
            setSelectedPost(data);
            setOpen(true);
            setDetailLoading(false);
        }).catch(error => {
            console.error("Failed to fetch post detail:", error);
            alert("문의사항을 불러오는 데 실패했습니다.");
            setDetailLoading(false);
        });
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPost(null);
    };

    const authorTypeMap = {
        "MEMBER": "물주",
        "CARGO": "차주",
        "ADMIN": "관리자",
    };

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                        공지/문의
                    </Typography>
                    <Tabs value={location.pathname} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="공지사항" value="/admin/notice" component={NavLink} to="/admin/notice" />
                        <Tab label="문의사항" value="/admin/inquirie" component={NavLink} to="/admin/inquirie" />
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
                                <TableCell>제목</TableCell>
                                <TableCell>내용</TableCell>
                                <TableCell>사용자구분</TableCell>
                                <TableCell>작성일</TableCell>
                                <TableCell>답변 여부</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow 
                                    key={post.postId}
                                    onClick={() => handleView(post.postId)}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                >
                                    <TableCell>{post.authorName}</TableCell>
                                    <TableCell>
                                        {post.title}
                                    </TableCell>
                                    <TableCell>{post.content.substring(0, 30)}...</TableCell>
                                    <TableCell>{authorTypeMap[post.authorType] || post.authorType}</TableCell>
                                    <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip label={post.hasResponse ? "답변완료" : "답변대기"} color={post.hasResponse ? "primary" : "default"} size="small" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>

            {selectedPost && (
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                    <DialogTitle>{selectedPost.title}</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                작성자: {selectedPost.authorName} | 작성일: {new Date(selectedPost.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {selectedPost.content}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>닫기</Button>
                    </DialogActions>
                </Dialog>
            )}

            {detailLoading && (
                <Dialog open={detailLoading}>
                    <DialogContent>
                        <CircularProgress />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default Inquirie;
