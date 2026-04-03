// src/components/Footer.js
import React from 'react';
import { Box, Grid, Typography, Link, Container } from '@mui/material';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'grey.200',
                py: 4,
                px: 2,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',     
                    justifyContent: 'center',  
                    textAlign: 'center'
                }}
            >
                <Grid container spacing={4}>
                    {/* 회사 정보 */}
                    <Grid item xs={12} sm={4} >
                        <Typography variant="h6" gutterBottom>
                            주식회사 문정현로지스
                        </Typography>
                        <Typography variant="body2" color="text.secondary"> 

                            대표이사 . 문정현 | 사업자등록번호 . 312-86-67742
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            paddingTop:1
                        }}>

                            주선면허번호 . 제4490000-3008-03-00015호
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            paddingTop:1
                        }}>

                            운송면허번호 . 제 4490000-2011-02-00261호
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                            paddingTop:1
                        }}>

                            통신사업자번호 . 2018-전남벌교-0226호
                        </Typography>
                    </Grid>

                    {/* 고객 지원 */}
                    {/* <Grid item xs={12} sm={4} sx={{display:{xs:'none',sm:'block' }}}>
                        <Typography variant="h6" gutterBottom>
                            고객 지원
                        </Typography>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            자주 묻는 질문
                        </Link>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            1:1 문의하기
                        </Link>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            운송 약관
                        </Link>
                    </Grid> */}

                    {/* 소셜 미디어 */}
                    {/* <Grid item xs={12} sm={4} sx={{display:{xs:'none',sm:'block' }}}>
                        <Typography variant="h6" gutterBottom>
                            소셜 미디어
                        </Typography>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            Instagram
                        </Link>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            Facebook
                        </Link>
                        <Link href="#" underline="hover" color="inherit" display="block">
                            YouTube
                        </Link>
                    </Grid> */}
                </Grid>

                {/* 하단 저작권 */}
                <Box mt={4} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} 화물 운송 시스템. 모든 권리 보유.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Footer;
