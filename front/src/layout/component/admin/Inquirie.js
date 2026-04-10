import React, { useState, useEffect } from "react";
import {
    Box, Typography, Tabs, Tab, TextField, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, Pagination, CircularProgress, Dialog,
    DialogTitle, DialogContent, DialogActions, Button, TableContainer, Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getPostList, getPostDetail } from "../../../api/qaboardApi";
import { createResponse, updateResponse } from "../../../api/adminResponseApi"; // 🔥 수정: 답변 API 추가
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

    // 🔥 수정: 답변 상태
    const [answerContent, setAnswerContent] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);

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
                console.error(error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [currentPage, location.pathname, searchKeyword]);

    const handleView = async (postId) => {
        setDetailLoading(true);
        try {
            const data = await getPostDetail(postId);
            setSelectedPost(data);

            // 🔥 수정: 기존 답변 세팅
            if (data.adminResponse) {
                setAnswerContent(data.adminResponse.content);
                setIsEditMode(true);
            } else {
                setAnswerContent("");
                setIsEditMode(false);
            }

            setOpen(true);
        } catch (e) {
            alert("조회 실패");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPost(null);
        setAnswerContent("");
        setIsEditMode(false);
    };

    // 🔥 수정: 답변 저장
    const handleSaveAnswer = async () => {
        if (!answerContent.trim()) {
            alert("답변을 입력하세요");
            return;
        }

        try {
            if (isEditMode) {
                await updateResponse(selectedPost.postId, { content: answerContent });
                alert("답변 수정 완료");
            } else {
                await createResponse(selectedPost.postId, { content: answerContent });
                alert("답변 등록 완료");
            }

            handleClose();
            fetchInquiries(); // 🔥 수정: 목록 갱신

        } catch (e) {
            alert("답변 저장 실패");
        }
    };

    const authorTypeMap = {
        MEMBER: "화주",
        CARGO: "차주",
        ADMIN: "관리자",
    };

    return (
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">공지/문의</Typography>
                    <Tabs value={location.pathname} onChange={handleTabChange}>
                        <Tab label="공지사항" value="/admin/notice" component={NavLink} to="/admin/notice" />
                        <Tab label="문의사항" value="/admin/inquirie" component={NavLink} to="/admin/inquirie" />
                    </Tabs>
                </Box>

                <TextField
                    size="small"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    placeholder="검색"
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1 }} />
                    }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>이름</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>내용</TableCell>
                            <TableCell>구분</TableCell>
                            <TableCell>작성일</TableCell>
                            <TableCell>상태</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {posts.map(post => (
                            <TableRow key={post.postId} onClick={() => handleView(post.postId)} sx={{ cursor: "pointer" }}>
                                <TableCell>{post.authorName}</TableCell>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>{post.content.substring(0, 20)}...</TableCell>
                                <TableCell>{authorTypeMap[post.authorType]}</TableCell>
                                <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip label={post.hasResponse ? "답변완료" : "대기"} color={post.hasResponse ? "primary" : "default"} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />

            {/* 🔥 수정: 답변 UI 추가 */}
            {selectedPost && (
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                    <DialogTitle>{selectedPost.title}</DialogTitle>

                    <DialogContent>
                        <Typography>
                            작성자: {selectedPost.authorName}
                        </Typography>

                        <Typography sx={{ mt: 2 }}>
                            {selectedPost.content}
                        </Typography>

                        {/* 🔥 답변 입력 */}
                        <Box sx={{ mt: 3 }}>
                            <Typography fontWeight="bold">관리자 답변</Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                placeholder="답변을 입력하세요"
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose}>닫기</Button>

                        {/* 🔥 저장 버튼 */}
                        <Button variant="contained" onClick={handleSaveAnswer}>
                            {isEditMode ? "수정" : "등록"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default Inquirie;