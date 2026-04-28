import React, { useState, useEffect } from "react";
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Paper, CircularProgress, TableContainer, Tabs, Tab, TextField
} from "@mui/material";
import { fetchAllDeliveries } from "../../../api/adminApi/adminDeliveryApi";
import SearchIcon from "@mui/icons-material/Search";

const DeliveryPage = () => {
    const [allDeliveries, setAllDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [keyword, setKeyword] = useState("");

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getStatusChip = (status) => {
        let label = "";
        let color = "default";
        switch (status) {
            case "COMPLETED": label = "배송 완료"; color = "success"; break;
            case "IN_TRANSIT": label = "배송 중";  color = "info";    break;
            case "PENDING":    label = "대기";      color = "warning"; break;
            default:           label = status;      color = "default";
        }
        return <Chip label={label} color={color} size="small" />;
    };

    useEffect(() => {
        const loadAllDeliveries = async () => {
            try {
                const data = await fetchAllDeliveries(activeTab, keyword);
                const sortedData = data.sort((a, b) => b.date.localeCompare(a.date));
                setAllDeliveries(sortedData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadAllDeliveries();
    }, [activeTab, keyword]);

    return (
        <Box flexGrow={1} p={{ xs: 2, md: 4 }}>
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                gap={2}
                mb={2}
            >
                <Box minWidth={0}>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                        전체 배송 내역
                    </Typography>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{ maxWidth: '100%' }}
                    >
                        <Tab label="전체" value="ALL" />
                        <Tab label="대기" value="PENDING" />
                        <Tab label="배송 중" value="IN_TRANSIT" />
                        <Tab label="배송 완료" value="COMPLETED" />
                    </Tabs>
                </Box>
                <TextField
                    variant="outlined"
                    placeholder="주문자/배송자 검색"
                    size="small"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "grey.500" }} />,
                    }}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">배송 내역을 불러오지 못했습니다: {error.message}</Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', width: '100%', mb: 2 }}>
                    <Table size="small" sx={{ minWidth: 900 }}>
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
                            {allDeliveries.length > 0 ? (
                                allDeliveries.map((d, i) => (
                                    <TableRow key={d.deliveryNo ?? i}>
                                        <TableCell>{d.date}</TableCell>
                                        <TableCell>{d.start}</TableCell>
                                        <TableCell>{d.end}</TableCell>
                                        <TableCell>{d.distance}</TableCell>
                                        <TableCell>{d.type}</TableCell>
                                        <TableCell>{d.amount}</TableCell>
                                        <TableCell>{d.owner}</TableCell>
                                        <TableCell>{d.carrierName}</TableCell>
                                        <TableCell>{getStatusChip(d.deliveryStatus)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        배송 기록이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default DeliveryPage;