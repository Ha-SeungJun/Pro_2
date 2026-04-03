import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../../slice/loginSlice';
import * as qaboardApi from '../../../api/qaboardApi';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Lock,
  Visibility,
  Forum,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

// Newly added components
import AdminResponseForm from './AdminResponseForm';
import AdminResponseEditForm from './AdminResponseEditForm';
import QAActionButtons from './QAActionButtons';
import QAEditForm from './QAEditForm';
import useCustomLogin from '../../../hooks/useCustomLogin';
import { getPostVisibility, getActionPermissions } from './qaPermissionUtils';

const QABoardMUI = () => {
  // Redux dispatch
  const dispatch = useDispatch();
  
  // Login state and permissions
  const { isAdmin, currentUserId, loginState } = useCustomLogin();

  const [activeMainTab, setActiveMainTab] = useState(0); // 0: 공지사항, 1: 문의하기, 2: FAQ
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');
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
  const [expandedFaqs, setExpandedFaqs] = useState(new Set());
  const [currentFaqPage, setCurrentFaqPage] = useState(1);

  // Newly added states
  const [editingItemId, setEditingItemId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [editingResponseId, setEditingResponseId] = useState(null);
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const ITEMS_PER_PAGE = 4;
  const FAQ_ITEMS_PER_PAGE = 5;

  // Common userInfo creation function
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

  // API로부터 게시글 목록 조회
  const fetchPostList = async () => {
    setLoading(true);
    setError(null); // Error state initialization
    try {
      const params = {
        category: activeCategory,
        keyword: searchTerm,
        page: currentPage - 1, // Backend is 0-indexed
        size: ITEMS_PER_PAGE
      };
      
      // Create user info for headers
      const userInfo = createUserInfo();
      
      const response = await qaboardApi.getPostList(params, userInfo);
      
      // Transform backend API response (including decoding usernames)
      const transformedData = response.content.map(item => ({
        id: item.postId,
        title: item.title,
        content: item.content || '',
        author: item.authorId || item.authorName || '익명', // authorId를 우선 사용, 없으면 authorName, 둘 다 없으면 익명
        authorId: item.authorId || '',
        authorType: item.authorType,
        category: item.category,
        date: item.createdAt ? item.createdAt.split('T')[0] : '',
        status: item.hasResponse ? 'answered' : 'pending',
        views: item.viewCount || 0,
        isPrivate: item.isPrivate,
        adminResponse: item.adminResponse ? {
          content: item.adminResponse.content,
          author: item.adminResponse.adminId || item.adminResponse.adminName || '관리자', // adminId를 우선 사용
          date: item.adminResponse.createdAt ? item.adminResponse.createdAt.split('T')[0] : ''
        } : null
      }));
      
      setQaData(transformedData);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch post list:', error);
      
      // Handle different error types
      let errorMessage = '게시글을 불러오는 중 오류가 발생했습니다.';
      if (error.response && error.response.status === 403) {
        errorMessage = '게시글 조회 권한이 없습니다.';
        console.warn('Access denied to QA Board');
      } else if (error.response && error.response.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        console.error('Server error occurred');
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      
      setError(errorMessage);
      
      // Set to empty array on error
      setQaData([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (activeMainTab === 0) { // Only fetch QA posts if '문의하기' tab is active (인덱스 0으로 변경)
      fetchPostList();
    }
  }, [activeCategory, searchTerm, currentPage, activeMainTab]);


  const faqItems = [
    {
      id: 1,
      question: '서비스 이용 시간은 어떻게 되나요?',
      answer: '24시간 연중무휴로 서비스를 이용하실 수 있습니다.',
      category: 'general'
    },
    {
      id: 2,
      question: '회원가입은 무료인가요?',
      answer: '네, 회원가입은 무료이며 기본 서비스도 무료로 이용 가능합니다.',
      category: 'service'
    },
    {
      id: 3,
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하여 재설정하실 수 있습니다.',
      category: 'technical'
    },
    {
      id: 4,
      question: '결제 방법을 변경할 수 있나요?',
      answer: '마이페이지에서 결제 정보를 수정하실 수 있습니다. 신용카드, 계좌이체 등 다양한 방법을 지원합니다.',
      category: 'billing'
    },
    {
      id: 5,
      question: '환불 정책은 어떻게 되나요?',
      answer: '서비스 이용 약관에 따라 결제일로부터 7일 이내 부분 환불이 가능합니다.',
      category: 'billing'
    },
    {
      id: 6,
      question: 'API 사용 제한이 있나요?',
      answer: '요금제에 따라 API 호출 제한이 다릅니다. 자세한 내용은 요금제 페이지를 확인해주세요.',
      category: 'technical'
    }
  ];

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

  const filteredFaqItems = faqItems.filter(faq => {
    return activeFaqCategory === 'all' || faq.category === activeFaqCategory;
  });

  // FAQ Pagination logic
  const totalFaqPages = Math.ceil(filteredFaqItems.length / FAQ_ITEMS_PER_PAGE);
  const startFaqIndex = (currentFaqPage - 1) * FAQ_ITEMS_PER_PAGE;
  const paginatedFaqItems = filteredFaqItems.slice(startFaqIndex, startFaqIndex + FAQ_ITEMS_PER_PAGE);

  const togglePostExpansion = async (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      // When a post is first opened, call the detail API to increment view count
      try {
        const userInfo = createUserInfo();
        const postDetail = await qaboardApi.getPostDetail(postId, userInfo);
        console.log(`View count incremented for post ID: ${postId}`);
        
        // Update the view count in the current qaData state
        setQaData(prevData => 
          prevData.map(post => 
            post.id === postId 
              ? { ...post, views: postDetail.viewCount || (post.views + 1) }
              : post
          )
        );
      } catch (error) {
        console.error('Failed to fetch post detail for view count:', error);
      }
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const toggleFaqExpansion = (faqId) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  // Initialize FAQ items to be expanded by default
  useEffect(() => {
    setExpandedFaqs(new Set(faqItems.map(faq => faq.id)));
  }, []);

  const handleSubmitInquiry = async () => {
    try {
      const postData = {
        title: newInquiry.title,
        content: newInquiry.content,
        category: newInquiry.category,
        isPrivate: newInquiry.isPrivate
      };
      
      const userInfo = createUserInfo();
      
      console.log('Creating post with data:', postData);
      console.log('User info:', userInfo);
      
      // Call API to create post
      const response = await qaboardApi.createPost(postData, userInfo);
      console.log('Post created successfully:', response);
      
      // Close dialog and reset form
      setIsNewInquiryOpen(false);
      setNewInquiry({ title: '', content: '', category: '', isPrivate: false });
      
      // Refresh post list
      fetchPostList();
      
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // New handler functions
  const handleEdit = (itemId) => {
    setEditingItemId(itemId);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const userInfo = createUserInfo('사용자');
        
        // Call API to delete post
        const response = await qaboardApi.deletePost(itemId, userInfo);
        console.log('Post deleted successfully:', response);
        
        // Refresh post list
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

  // Admin-only handler functions
  const handleAdminEdit = (itemId) => {
    if (window.confirm('관리자 권한으로 이 게시글을 수정하시겠습니까?')) {
      setEditingItemId(itemId);
    }
  };

  const handleAdminDelete = async (itemId) => {
    if (window.confirm('관리자 권한으로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      try {
        const userInfo = createUserInfo('관리자');
        
        // Call API to delete post (admin privilege)
        const response = await qaboardApi.deletePost(itemId, userInfo);
        console.log('Post deleted by admin successfully:', response);
        
        // Refresh post list
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
      
      // Call API to update admin response
      const response = await qaboardApi.updateAdminResponse(itemId, updatedResponse, userInfo);
      console.log('Admin response updated successfully:', response);
      
      // Refresh post list
      await fetchPostList();
      
      // 해당 게시글을 펼친 상태로 유지
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
      console.log('handleSaveEdit called with:', updatedItem);
      const userInfo = createUserInfo(); // Use current logged-in user info
      console.log('userInfo:', userInfo);
      
      const updateData = {
        title: updatedItem.title,
        content: updatedItem.content,
        category: updatedItem.category,
        isPrivate: updatedItem.isPrivate
      };
      console.log('updateData:', updateData);
      console.log('postId:', updatedItem.id);
      
      // Call API to update post
      const response = await qaboardApi.updatePost(updatedItem.id, updateData, userInfo);
      console.log('Post updated successfully:', response);
      
      // Refresh post list
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
      
      // Call API to create admin response
      const response = await qaboardApi.createAdminResponse(responseData.questionId, responseData, userInfo);
      console.log('Admin response created successfully:', response);
      
      // Refresh post list
      await fetchPostList();
      
      // 해당 게시글을 펼친 상태로 유지
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

  const handleTabChange = (event, newValue) => {
    setActiveMainTab(newValue);
    setCurrentPage(1); // Reset page when changing tabs
    setSearchTerm(''); // Clear search term when changing tabs
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

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeMainTab} onChange={handleTabChange} centered>
          <Tab 
            icon={<Forum />} 
            label="문의하기" 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1.1rem' }}
          />
          <Tab 
            label="FAQ" 
            sx={{ minHeight: 64, fontSize: '1.1rem' }}
          />
        </Tabs>
      </Box>

      {activeMainTab === 0 && ( // "문의하기" tab content
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
                  {/* Edit Mode */}
                  {isEditing && (
                    <QAEditForm
                      item={item}
                      categories={categories}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      isVisible={true}
                    />
                  )}

                  {/* Normal Display Mode */}
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
                      
                      {/* Content Display (based on permissions) */}
                      {isExpanded && (
                        <CardContent sx={{ pt: 0 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                          >
                            {visibility.showContent ? item.content : '비공개 글입니다.'}
                          </Typography>
                        </CardContent>
                      )}

                      {/* Admin Response Display */}
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

                      {/* Author Info and View Count */}
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

                      {/* Action Buttons */}
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

                  {/* Admin Reply Form */}
                  {isReplying && (
                    <AdminResponseForm
                      questionId={item.id}
                      onSubmit={handleSubmitAdminResponse}
                      onCancel={handleCancelAdminResponse}
                      isVisible={true}
                    />
                  )}

                  {/* Admin Response Edit Form */}
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

          {/* Error State Display */}
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

          {/* Empty State Display */}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, value) => {
                  setCurrentPage(value);
                  setExpandedPosts(new Set()); // 페이지 변경 시 확장된 게시글 상태 초기화
                }}
                color="primary"
              />
            </Box>
          )}

          {/* New Inquiry Dialog */}
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
      )}

      {activeMainTab === 1 && ( // "FAQ" tab content
        <Box>
          {/* FAQ Category Buttons */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFaqCategory === category.id ? 'contained' : 'outlined'}
                  onClick={() => setActiveFaqCategory(category.id)}
                  sx={{ minWidth: 100, mb: 1 }}
                >
                  {category.name}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* FAQ List */}
          <Box mb={3}>
            {paginatedFaqItems.map((faq) => (
              <Accordion 
                key={faq.id}
                expanded={expandedFaqs.has(faq.id)}
                onChange={() => toggleFaqExpansion(faq.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                      sx={{ 
                        width: 24, height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Q
                    </Box>
                    <Typography variant="h6" component="h3">
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Box 
                      sx={{ 
                        width: 24, height: 24, 
                        borderRadius: '50%', 
                        backgroundColor: 'secondary.main', 
                        color: 'white',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        mt: 0.5
                      }}
                    >
                      A
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {filteredFaqItems.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">검색 결과가 없습니다.</Typography>
            </Box>
          )}

          {/* FAQ Pagination */}
          {totalFaqPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalFaqPages}
                page={currentFaqPage}
                onChange={(event, value) => setCurrentFaqPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default QABoardMUI;