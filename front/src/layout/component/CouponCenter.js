import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

const CouponCenter = ({ userId }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. 내 쿠폰 목록 불러오기
    const fetchMyCoupons = async () => {
        try {
            // userId가 'admin'이라고 가정하거나 props로 전달받음
            const res = await axios.get(`/g2i4/coupons/my-list/${userId}`);
            setCoupons(res.data);
        } catch (err) {
            console.error("쿠폰 목록 로드 실패:", err);
        }
    };

    // 2. 테스트 쿠폰 발급 버튼 클릭
    const handleIssueCoupons = async () => {
        setLoading(true);
        try {
            await axios.post('/g2i4/coupons/issue-test', { memId: userId });
            alert("테스트 쿠폰 2종이 발급되었습니다!");
            fetchMyCoupons(); // 발급 후 목록 새로고침
        } catch (err) {
            alert("발급 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchMyCoupons();
    }, [userId]);

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>쿠폰 센터</Typography>
            
            {/* 쿠폰 발급 버튼 */}
            <Button 
                variant="contained" 
                fullWidth 
                onClick={handleIssueCoupons} 
                disabled={loading}
                sx={{ mb: 4, py: 1.5, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
            >
                {loading ? '발급 중...' : '테스트 쿠폰 무한 받기'}
            </Button>

            <Typography variant="h6" mb={2}>내가 보유한 쿠폰 ({coupons.length})</Typography>
            
            <Paper elevation={2}>
                <List>
                    {coupons.length === 0 ? (
                        <ListItem><ListItemText primary="보유한 쿠폰이 없습니다." /></ListItem>
                    ) : (
                        coupons.map((mc, index) => (
                            <React.Fragment key={mc.mcno}>
                                <ListItem>
                                    <ListItemText 
                                        primary={mc.coupon.couponName} 
                                        secondary={`만료일: ${new Date(mc.expiry_date).toLocaleDateString()} 까지`} 
                                    />
                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                        {mc.coupon.discountType === 'FLAT' 
                                            ? `${mc.coupon.discountValue.toLocaleString()}원 할인` 
                                            : `${mc.coupon.discountValue}% 할인`}
                                    </Typography>
                                </ListItem>
                                {index < coupons.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default CouponCenter;