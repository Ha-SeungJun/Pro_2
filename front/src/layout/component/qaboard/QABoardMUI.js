import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../../slice/loginSlice';
import * as qaboardApi from '../../../api/qaboardApi';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Pagination,
  InputAdornment,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Search,
  Person,
  CalendarToday,
  ExpandMore,
  Lock
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

import AdminResponseForm from './AdminResponseForm';
import AdminResponseEditForm from './AdminResponseEditForm';
import QAActionButtons from './QAActionButtons';
import QAEditForm from './QAEditForm';
import useCustomLogin from '../../../hooks/useCustomLogin';
import { getPostVisibility, getActionPermissions } from './qaPermissionUtils';

const QABoardMUI = () => {
  const dispatch = useDispatch();
  const { isAdmin, currentUserId, loginState } = useCustomLogin();

  // 수정: FAQ/탭 관련 state 제거
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    title: '',
    content: '',
    category: '',
    isPrivate: false
  });
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const [editingItemId, setEditingItemId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [editingResponseId, setEditingResponseId] = useState(null);
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const ITEMS_PER_PAGE = 4;

  const createUserInfo = (defaultUserName = '익명') => ({
    userId: currentUserId || loginState.memberId || 'anonymous',
    userName: loginState.nickname || defaultUserName
  });

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'general', name: '일반문의' },
    { id: 'technical', name: '기술지원' },
    { id: 'billing', name: '결제/요금' },
    { id: 'service', name: '서비스이용' },
    { id: 'etc', name: '기타' }
  ];

  const fetchPostList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: activeCategory,
        keyword: searchTerm,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE
      };

      const userInfo = createUserInfo();
      const response = await qaboardApi.getPostList(params, userInfo);

      const transformedData = response.content.map(item => ({
        id: item.postId,
        title: item.title,
        content: item.content || '',
        author: item.authorId || item.authorName || '익명',
        authorId: item.authorId || '',
        authorType: item.authorType,
        category: item.category,
        date: item.createdAt ? item.createdAt.split('T')[0] : '',
        status: item.hasResponse ? 'answered' : 'pending',
        views: item.viewCount || 0,
        isPrivate: item.isPrivate,
        adminResponse: item.adminResponse ? {
          content: item.adminResponse.content,
          author: item.adminResponse.adminId || item.adminResponse.adminName || '관리자',
          date: item.adminResponse.createdAt ? item.adminResponse.createdAt.split('T')[0] : ''
        } : null
      }));

      setQaData(transformedData);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch post list:', error);

      let errorMessage = '게시글을 불러오는 중 오류가 발생했습니다.';
      if (error.response && error.response.status === 403) {
        errorMessage = '게시글 조회 권한이 없습니다.';
      } else if (error.response && error.response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }

      setError(errorMessage);
      setQaData([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 수정: activeMainTab 의존 제거, 문의사항만 로딩
  useEffect(() => {
    fetchPostList();
  }, [activeCategory, searchTerm, currentPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'pending': return { backgroundColor: '#fff3e0', color: '#f57c00' };
      case 'resolved': return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      default: return { backgroundColor: '#f5f5f5', color: '#424242' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'answered': return '답변완료';
      case 'pending': return '답변대기';
      case 'resolved': return '해결완료';
      default: return '미분류';
    }
  };

  const togglePostExpansion = async (postId) => {
    const newExpanded = new Set(expandedPosts);

    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      try {
        const userInfo = createUserInfo();

        const postDetail = await qaboardApi.getPostDetail(postId, userInfo);

        setQaData(prevData =>
          prevData.map(post =>
            post.id === postId
              ? {
                  ...post,
                  content: postDetail.content,
                  views: postDetail.viewCount,
                  adminResponse: postDetail.adminResponse
                    ? {
                        content: postDetail.adminResponse.content,
                        author: postDetail.adminResponse.adminName,
                        date: postDetail.adminResponse.createdAt?.split('T')[0]
                      }
                    : null,
                  status: postDetail.hasResponse ? 'answered' : 'pending'
                }
              : post
          )
        );

      } catch (error) {
        console.error('상세 조회 실패:', error);
      }

      newExpanded.add(postId);
    }

    setExpandedPosts(newExpanded);
  };

  const handleSubmitInquiry = async () => {
    try {
      const postData = {
        title: newInquiry.title,
        content: newInquiry.content,
        category: newInquiry.category,
        isPrivate: newInquiry.isPrivate
      };

      const userInfo = createUserInfo();

      const response = await qaboardApi.createPost(postData, userInfo);

      setIsNewInquiryOpen(false);
      setNewInquiry({ title: '', content: '', category: '', isPrivate: false });
      fetchPostList();

    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEdit = (itemId) => {
    setEditingItemId(itemId);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const userInfo = createUserInfo('사용자');
        await qaboardApi.deletePost(itemId, userInfo);
        fetchPostList();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleReply = (itemId) => {
    setReplyingToId(itemId);
  };

  const handleAdminEdit = (itemId) => {
    if (window.confirm('관리자 권한으로 이 게시글을 수정하시겠습니까?')) {
      setEditingItemId(itemId);
    }
  };

  const handleAdminDelete = async (itemId) => {
    if (window.confirm('관리자 권한으로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      try {
        const userInfo = createUserInfo('관리자');
        await qaboardApi.deletePost(itemId, userInfo);
        fetchPostList();
      } catch (error) {
        console.error('Failed to delete post by admin:', error);
        alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleEditResponse = (itemId) => {
    setEditingResponseId(itemId);
  };

  const handleSaveResponseEdit = async (itemId, updatedResponse) => {
    try {
      const userInfo = createUserInfo('관리자');
      await qaboardApi.updateAdminResponse(itemId, updatedResponse, userInfo);

      await fetchPostList();

      const newExpanded = new Set(expandedPosts);
      newExpanded.add(itemId);
      setExpandedPosts(newExpanded);

      setEditingResponseId(null);
      alert('답변이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update admin response:', error);
      alert('답변 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelResponseEdit = () => {
    setEditingResponseId(null);
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      const userInfo = createUserInfo();

      const updateData = {
        title: updatedItem.title,
        content: updatedItem.content,
        category: updatedItem.category,
        isPrivate: updatedItem.isPrivate
      };

      await qaboardApi.updatePost(updatedItem.id, updateData, userInfo);
      fetchPostList();
      setEditingItemId(null);

    } catch (error) {
      console.error('Failed to update post:', error);
      alert('게시글 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSubmitAdminResponse = async (responseData) => {
    try {
      const userInfo = createUserInfo('관리자');
      await qaboardApi.createAdminResponse(responseData.questionId, responseData, userInfo);

      await fetchPostList();

      const newExpanded = new Set(expandedPosts);
      newExpanded.add(responseData.questionId);
      setExpandedPosts(newExpanded);

      setReplyingToId(null);
      alert('답변이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('Failed to create admin response:', error);
      alert('답변 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelAdminResponse = () => {
    setReplyingToId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Main Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          고객지원
        </Typography>
        <Typography variant="h6" color="text.secondary">
          궁금한 사항이 있으시면 언제든 문의해주세요
        </Typography>
      </Box>

      {/* 수정: Tabs 영역 삭제 */}

      <Box>
        {/* Category Tabs */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'contained' : 'outlined'}
                onClick={() => setActiveCategory(category.id)}
                sx={{ minWidth: 100, mb: 1 }}
              >
                {category.name}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Search Bar and New Inquiry Button */}
        <Box display="flex" gap={2} mb={3} alignItems="center">
          <TextField
            fullWidth
            placeholder="궁금한 내용을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={() => setIsNewInquiryOpen(true)}
            sx={{ minWidth: 140, height: 56 }}
          >
            새 문의 작성하기
          </Button>
        </Box>

        {/* Q&A List */}
        <Box mb={3}>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={6}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                게시글을 불러오는 중입니다...
              </Typography>
            </Box>
          ) : qaData.map((item) => {
            const visibility = getPostVisibility(item, isAdmin, currentUserId);
            const permissions = getActionPermissions(item, isAdmin, currentUserId);
            const isExpanded = expandedPosts.has(item.id);
            const isEditing = editingItemId === item.id;
            const isReplying = replyingToId === item.id;
            const isEditingResponse = editingResponseId === item.id;

            return (
              <Box key={item.id} mb={2}>
                {isEditing && (
                  <QAEditForm
                    item={item}
                    categories={categories}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    isVisible={true}
                  />
                )}

                {!isEditing && (
                  <Card
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                    onClick={(e) => {
                      e.preventDefault();
                      togglePostExpansion(item.id);
                    }}
                  >
                    <CardHeader
                      title={
                        <Box>
                          <Box display="flex" gap={1} mb={1} alignItems="center">
                            <Chip
                              label={getStatusText(item.status)}
                              size="small"
                              sx={getStatusColor(item.status)}
                            />
                            {item.isPrivate && (
                              <Chip
                                icon={<Lock />}
                                label="비공개"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {categories.find(c => c.id === item.category)?.name}
                            </Typography>
                          </Box>
                          <Typography variant="h6" component="h3">
                            {visibility.displayTitle}
                          </Typography>
                        </Box>
                      }
                      action={
                        <IconButton onClick={() => togglePostExpansion(item.id)}>
                          <ExpandMore sx={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }} />
                        </IconButton>
                      }
                    />

                    {isExpanded && (
                      <CardContent sx={{ pt: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                          {visibility.showContent ? item.content : '비공개 글입니다.'}
                        </Typography>
                      </CardContent>
                    )}

                    {isExpanded && visibility.showContent && item.adminResponse && (
                      <>
                        <Divider />
                        <CardContent>
                          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="subtitle2" color="primary">
                                {item.adminResponse.author}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.adminResponse.date}
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              {item.adminResponse.content}
                            </Typography>
                          </Box>
                        </CardContent>
                      </>
                    )}

                    {isExpanded && (
                      <CardContent sx={{ pt: 0 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" gap={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Person fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {item.author}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <CalendarToday fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {item.date}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            조회 {item.views}
                          </Typography>
                        </Box>
                      </CardContent>
                    )}

                    {isExpanded && (
                      <QAActionButtons
                        item={item}
                        isAdmin={isAdmin}
                        isAuthor={permissions.canEdit}
                        currentUserId={currentUserId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReply={handleReply}
                        onAdminEdit={handleAdminEdit}
                        onAdminDelete={handleAdminDelete}
                        onEditResponse={handleEditResponse}
                        isExpanded={isExpanded}
                      />
                    )}
                  </Card>
                )}

                {isReplying && (
                  <AdminResponseForm
                    questionId={item.id}
                    onSubmit={handleSubmitAdminResponse}
                    onCancel={handleCancelAdminResponse}
                    isVisible={true}
                  />
                )}

                {isEditingResponse && (
                  <AdminResponseEditForm
                    item={item}
                    onSubmit={handleSaveResponseEdit}
                    onCancel={handleCancelResponseEdit}
                    isVisible={true}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {!loading && error && (
          <Box textAlign="center" py={6}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchPostList}
              sx={{ mt: 2 }}
            >
              다시 시도
            </Button>
          </Box>
        )}

        {!loading && !error && qaData.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary" variant="h6" gutterBottom>
              게시글이 없습니다
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
              {searchTerm ? '검색 조건에 맞는 게시글이 없습니다.' : '첫 번째 질문을 작성해보세요!'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                onClick={() => setIsNewInquiryOpen(true)}
              >
                첫 질문 작성하기
              </Button>
            )}
          </Box>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => {
                setCurrentPage(value);
                setExpandedPosts(new Set());
              }}
              color="primary"
            />
          </Box>
        )}

        <Dialog
          open={isNewInquiryOpen}
          onClose={() => setIsNewInquiryOpen(false)}
          maxWidth="sm"
          fullWidth
          disableRestoreFocus={false}
          keepMounted={false}
        >
          <DialogTitle>새 문의 작성</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="제목"
                fullWidth
                value={newInquiry.title}
                onChange={(e) => setNewInquiry({ ...newInquiry, title: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={newInquiry.category}
                  label="카테고리"
                  onChange={(e) => setNewInquiry({ ...newInquiry, category: e.target.value })}
                >
                  {categories.filter(c => c.id !== 'all').map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="내용"
                multiline
                rows={4}
                fullWidth
                value={newInquiry.content}
                onChange={(e) => setNewInquiry({ ...newInquiry, content: e.target.value })}
                placeholder="문의 내용을 자세히 작성해주세요"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={newInquiry.isPrivate}
                    onChange={(e) => setNewInquiry({ ...newInquiry, isPrivate: e.target.checked })}
                  />
                }
                label="비공개 문의"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewInquiryOpen(false)}>취소</Button>
            <Button onClick={handleSubmitInquiry} variant="contained">문의 등록</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default QABoardMUI;