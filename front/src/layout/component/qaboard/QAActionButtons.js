import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  AdminPanelSettings as AdminIcon,
  EditNote as EditNoteIcon
} from '@mui/icons-material';
import { getActionPermissions } from './qaPermissionUtils';

const QAActionButtons = ({ 
  item, 
  isAdmin, 
  isAuthor, 
  onEdit, 
  onDelete, 
  onReply,
  onAdminEdit,
  onAdminDelete,
  onEditResponse,
  isExpanded,
  currentUserId
}) => {
  // 확장되지 않은 상태에서는 버튼 숨김
  if (!isExpanded) return null;

  // 권한 확인
  const permissions = getActionPermissions(item, isAdmin, currentUserId);
  
  // 디버그 로그 추가
  console.log('QAActionButtons Debug:', {
    itemId: item.id,
    isAdmin,
    currentUserId,
    permissions
  });

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {/* 작성자 권한 버튼들 */}
        {permissions.canEdit && (
          <Tooltip title="게시글 수정">
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(item.id)}
              sx={{ minWidth: 80 }}
            >
              수정
            </Button>
          </Tooltip>
        )}

        {permissions.canDelete && (
          <Tooltip title="게시글 삭제">
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(item.id)}
              sx={{ minWidth: 80 }}
            >
              삭제
            </Button>
          </Tooltip>
        )}

        {/* 관리자 전용 게시글 수정/삭제 버튼들 */}
        {permissions.canEditAsAdmin && onAdminEdit && (
          <Tooltip title="관리자 권한으로 게시글 수정">
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<AdminIcon />}
              onClick={() => onAdminEdit(item.id)}
              sx={{ minWidth: 100 }}
            >
              관리자 수정
            </Button>
          </Tooltip>
        )}

        {permissions.canDeleteAsAdmin && onAdminDelete && (
          <Tooltip title="관리자 권한으로 게시글 삭제">
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<AdminIcon />}
              onClick={() => onAdminDelete(item.id)}
              sx={{ minWidth: 100 }}
            >
              관리자 삭제
            </Button>
          </Tooltip>
        )}

        {/* 관리자 답변 관련 버튼들 */}
        {permissions.canReply && (
          <Tooltip title="관리자 답변 작성">
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ReplyIcon />}
              onClick={() => onReply(item.id)}
              sx={{ minWidth: 80 }}
            >
              답변
            </Button>
          </Tooltip>
        )}

        {permissions.canEditResponse && onEditResponse && (
          <Tooltip title="관리자 답변 수정">
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<EditNoteIcon />}
              onClick={() => onEditResponse(item.id)}
              sx={{ minWidth: 100 }}
            >
              답변 수정
            </Button>
          </Tooltip>
        )}

        {/* 관리자 상태 표시 아이콘 */}
        {isAdmin && (
          <Tooltip title="관리자 권한으로 확인 중">
            <IconButton size="small" color="primary">
              <AdminIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};

export default QAActionButtons;