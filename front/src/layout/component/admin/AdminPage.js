import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import { fetchDashboardData } from "../../../api/adminApi/adminDashboardApi";


Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchDashboardData();
        console.log("Axios Response:", response);
        setDashboardData(response);
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 다시 시도해 주세요.");
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    console.log("Dashboard Data (when no data):", dashboardData);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">표시할 데이터가 없습니다.</Alert>
      </Box>
    );
  }

  const barData = {
    labels: dashboardData.monthlyDeliveries.map(item => item.month),
    datasets: [
      {
        label: '월 별 배송내역',
        data: dashboardData.monthlyDeliveries.map(item => item.count),
        backgroundColor: [
          'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
          'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      title: { display: true, text: '월별 배송 내역', font: { size: 18, weight: 'bold' } },
      legend: { display: true, position: 'top' },
    },
  };

  const bar2Data = {
    labels: dashboardData.newMembersByMonth.map(item => item.month),
    datasets: [
      {
        label: '신규 회원가입',
        data: dashboardData.newMembersByMonth.map(item => item.count),
        backgroundColor: [
          'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
          'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const bar2Options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      title: { display: true, text: '신규 회원가입', font: { size: 18, weight: 'bold' } },
      legend: { display: true, position: 'top' },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          이용 통계
        </Typography>

        <Box display="flex" gap={2} mb={4}>
          {[
            { label: "사용자수", value: dashboardData.totalUsers },
            { label: "이번달 매출", value: dashboardData.monthlyRevenue },
            { label: "신규회원", value: dashboardData.newMembers },
            { label: "총 배송건", value: dashboardData.totalDeliveries },
          ].map((item, idx) => (
            <Paper
              key={idx}
              elevation={3}
              sx={{
                flex: 1,
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1">{item.label}</Typography>
              <Typography variant="h5" fontWeight="bold">
                {item.value.toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 4,
          }}
        >
          <Paper sx={{ p: 3, height: { xs: 360, sm: 420, md: 480 }, width: "100%", minWidth: 0, boxSizing: "border-box", overflow: "hidden" }}>
            <Bar
              data={bar2Data}
              options={{
                ...bar2Options,
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 8 },
                scales: {
                  x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0, autoSkip: true } },
                  y: { beginAtZero: true, grid: { drawBorder: false } },
                },
                plugins: {
                  title: { display: true, text: "신규 회원가입", font: { size: 18, weight: "bold" } },
                  legend: { display: false },
                  tooltip: { mode: "index", intersect: false },
                },
                categoryPercentage: 0.6,
                barPercentage: 0.8,
              }}
            />
          </Paper>

          <Paper sx={{ p: 3, height: { xs: 360, sm: 420, md: 480 }, width: "100%", minWidth: 0, boxSizing: "border-box", overflow: "hidden" }}>
            <Bar
              data={barData}
              options={{
                ...barOptions,
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 8 },
                scales: {
                  x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0, autoSkip: true } },
                  y: { beginAtZero: true, grid: { drawBorder: false } },
                },
                plugins: {
                  title: { display: true, text: "월별 배송 내역", font: { size: 18, weight: "bold" } },
                  legend: { display: false },
                  tooltip: { mode: "index", intersect: false },
                },
                categoryPercentage: 0.6,
                barPercentage: 0.8,
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;