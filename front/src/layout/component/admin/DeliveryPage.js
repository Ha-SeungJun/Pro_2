import React, { useState, useEffect } from "react";
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, Paper, CircularProgress
} from "@mui/material";
import { fetchAllDeliveries } from "../../../api/adminApi/adminDeliveryApi";
import { Tabs, Tab, TextField } from "@mui/material";
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

    useEffect(() => {
        const loadAllDeliveries = async () => {
            try {
                const data = await fetchAllDeliveries(activeTab, keyword);
                const sortedData = data.sort((a, b) => {
                    // Assuming date is in "yyyy.MM.dd" format, string comparison works for descending order
                    return b.date.localeCompare(a.date);
                });
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
        <Box flexGrow={1} p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box> {/* Inner Box for title and tabs */}
                    <Typography variant="h5" fontWeight="bold" mb={1}> {/* mb={1} for spacing */}
                        전체 배송 내역
                    </Typography>
                    <Tabs value={activeTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
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
                <Paper variant="outlined" sx={{ mb: 2 }}>
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
                </Paper>
            )}
        </Box>
    );
};

export default DeliveryPage;