import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

// 🚨 1. 부모 컴포넌트에서 userType(로그인 유형)도 같이 넘겨받도록 추가합니다.
const CouponCenter = ({ userId, userType }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. 내 쿠폰 목록 불러오기
    const fetchMyCoupons = async () => {
        try {
            // 🚨 2. 토큰을 세션 스토리지에서 꺼냅니다.
            const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("ACCESS_TOKEN");

            // 🚨 3. 주소에서 ${userId}를 지우고, 헤더에 신분증(토큰)을 실어서 보냅니다!
            const res = await axios.get(`/g2i4/coupons/my-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data);
        } catch (err) {
            console.error("쿠폰 목록 로드 실패:", err);
        }
    };

    // 2. 테스트 쿠폰 발급 버튼 클릭
    const handleIssueCoupons = async () => {
        setLoading(true);
        try {
            // 발급할 때도 토큰을 챙겨가는 것이 안전합니다.
            const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("ACCESS_TOKEN");
            await axios.post('/g2i4/coupons/issue-test',
                { memId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("테스트 쿠폰이 발급되었습니다!");
            fetchMyCoupons(); // 발급 후 목록 새로고침
        } catch (err) {
            alert("발급 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // userType이 MEMBER(화주)일 때만 쿠폰을 불러옵니다.
        if (userId && userType === 'MEMBER') {
            fetchMyCoupons();
        }
    }, [userId, userType]);

    // 🚨 4. 차주(DRIVER)인 경우 아예 이 화면 자체를 안 그립니다! (빈 화면 반환)
    if (userType !== 'MEMBER') {
        return null; // 차주 계정에서는 쿠폰 센터가 통째로 증발합니다.
    }

    return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>쿠폰 센터</Typography>

            {/* 쿠폰 발급 버튼 */}
            <Button
                variant="contained"
                fullWidth
                onClick={handleIssueCoupons}
                sx={{ mb: 4, py: 1.5, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
                disabled={loading || coupons.length > 0}
            >
                {loading ? '발급 중...' : coupons.length > 0 ? '이미 쿠폰을 보유 중입니다' : '쿠폰 받기'}
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
                                        secondary={
                                            <>
                                                {/*  발급일 추가 */}
                                                <div>발급일: {new Date(mc.issuedAt).toLocaleString()}</div>
                                                <div>만료일: {new Date(mc.expiryDate).toLocaleDateString()} 까지</div>
                                            </>
                                        }
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