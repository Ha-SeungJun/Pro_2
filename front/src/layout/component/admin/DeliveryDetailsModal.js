import React from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Paper, Modal
} from "@mui/material";

const DeliveryDetailsModal = ({ open, onClose, selectedUser }) => {
    // Copied from DeliveryPage.js and MemberAll.js
    const getStatusChip = (status) => {
        let label = "";
        let color = "default";
        switch (status) {
            case "COMPLETED":
                label = "배송 완료";
                color = "success";
                break;
            case "IN_TRANSIT":
                label = "배송 중";
                color = "info";
                break;
            case "PENDING":
                label = "대기";
                color = "warning";
                break;
            default:
                label = status;
                color = "default";
        }
        return <Chip label={label} color={color} size="small" />;
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, // Adjust width as needed
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    if (!selectedUser) {
        return null; // Don't render if no user is selected
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="delivery-details-modal-title"
            aria-describedby="delivery-details-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="delivery-details-modal-title" variant="h6" component="h2" fontWeight="bold" mb={2}>
                    {selectedUser.memName ? `${selectedUser.memName}님의 배송 내역` : '배송 내역'}
                </Typography>
                {selectedUser && (selectedUser.details || []).length > 0 ? (
                    <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                        {selectedUser.details.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                {selectedUser.userType === 'OWNER' ? '주문 기록이 없습니다(물주)' : '배송 기록이 없습니다(차주)'}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>출발 날짜</TableCell>
                                        <TableCell>출발지</TableCell>
                                        <TableCell>도착지</TableCell>
                                        <TableCell>거리</TableCell>
                                        <TableCell>종류</TableCell>
                                        <TableCell>금액</TableCell>
                                        <TableCell>주문자</TableCell>
                                        <TableCell>배송자</TableCell>
                                        <TableCell>배송 현황</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedUser.details
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((d, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{d.date}</TableCell><TableCell>{d.start}</TableCell><TableCell>{d.end}</TableCell><TableCell>{d.distance}</TableCell><TableCell>{d.type}</TableCell><TableCell>{d.amount}</TableCell><TableCell>{d.owner}</TableCell><TableCell>{d.carrierName}</TableCell><TableCell>{getStatusChip(d.deliveryStatus)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                ) : selectedUser && (
                    <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            {selectedUser.userType === 'OWNER' ? '주문 기록이 없습니다(물주)' : '배송 기록이 없습니다(차주)'}
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Modal>
    );
};

export default DeliveryDetailsModal;
