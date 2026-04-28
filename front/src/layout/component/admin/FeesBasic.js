import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Button, TextField, IconButton, Stack, Alert, Tabs, Tab } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchFeesBasicFull, saveFeeBasicCell, addBasicRow, deleteBasicRow } from "../../../api/adminApi/adminApi";
import { NavLink, useLocation } from "react-router-dom";

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
  backgroundColor: "#f5f5f5",
  whiteSpace: "nowrap",
};
const tdStyle = { border: "1px solid #ccc", padding: "4px", textAlign: "center" };
const inputStyle = {
  width: "90px",
  textAlign: "center",
  padding: "4px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const FeesBasic = () => {
  const [loading, setLoading] = useState(false);

  return (
    <Box flexGrow={1} p={{ xs: 2, md: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom
        sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' }, mb: 3 }}
      >
        기본요금
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <FeesBasicTable setLoading={setLoading} />
      )}
    </Box>
  );
};

const FeesBasicTable = ({ setLoading }) => {
  const [columns, setColumns] = useState(["거리별 요금", "기본 요금"]);
  const [rows, setRows] = useState([]);
  const [grid, setGrid] = useState([]);
  const [newRow, setNewRow] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();

  const activeTab = location.pathname.includes("feesExtra") ? 1 : 0;

  const fetchFull = useCallback(async () => {
    setError("");
    try {
      const res = await fetchFeesBasicFull();
      const data = res?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setColumns(Array.isArray(data.columns) ? data.columns : ["거리별 요금", "기본 요금"]);
      setGrid(Array.isArray(data.grid) ? data.grid : []);
    } catch (e) {
      console.error("[basic/full] failed:", e);
      setError("요금 데이터를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => { fetchFull(); }, [fetchFull]);

  const handleChange = (r, c, v) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (!next[r]) next[r] = [];
      next[r][c] = v;
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (!rows || rows.length === 0) return;
    if (!window.confirm("입력한 모든 요금을 일괄 저장하시겠습니까?")) return;
    setLoading(true);
    try {
      for (let i = 0; i < rows.length; i++) {
        const payload = {
          weight: String(rows[i] || "").trim(),
          ratePerKm: Number(grid[i]?.[0]) || 0,
          initialCharge: Number(grid[i]?.[1]) || 0,
          cargoName: "미지정"
        };
        await saveFeeBasicCell(payload);
      }
      await fetchFull();
      alert("전체 요금표 저장 성공!");
    } catch (e) {
      console.error("400 에러 상세 내용:", e.response?.data);
      alert("저장 실패 (400): 서버가 데이터를 거절했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onAddRow = async () => {
    const name = newRow.trim();
    if (!name) return;
    try {
      await addBasicRow(name);
      setNewRow("");
      await fetchFull();
    } catch (e) { alert("행 추가 실패"); }
  };

  const onDeleteRow = async (name) => {
    const key = (name || "").trim();
    if (!key) return;
    if (!window.confirm(`'${key}' 행을 삭제하시겠습니까?`)) return;
    try {
      await deleteBasicRow(key);
      await fetchFull();
    } catch (e) { alert("행 삭제 실패"); }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={activeTab}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab value={0} label="기본요금" component={NavLink} to="/admin/feesBasic" />
        <Tab value={1} label="추가요금" component={NavLink} to="/admin/feesExtra" />
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        mb={3}
      >
        <TextField
          size="small"
          placeholder="새 중량 (예: 7톤)"
          value={newRow}
          onChange={(e) => setNewRow(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
        <Button variant="contained" onClick={onAddRow} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          행 추가
        </Button>
      </Stack>

      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 360 }}>
          <thead>
            <tr>
              <th style={thStyle}>중량(톤수)</th>
              {columns.map((col, idx) => <th key={idx} style={thStyle}>{col}</th>)}
              <th style={thStyle}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rowLabel, rowIdx) => (
              <tr key={rowLabel}>
                <th style={thStyle}>{rowLabel}</th>
                {columns.map((_, colIdx) => (
                  <td key={`${rowLabel}-${colIdx}`} style={tdStyle}>
                    <input
                      type="text"
                      value={grid[rowIdx]?.[colIdx] ?? ""}
                      onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                ))}
                <td style={tdStyle}>
                  <IconButton color="error" onClick={() => onDeleteRow(rowLabel)}>
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSaveAll}
          sx={{ width: { xs: '100%', sm: 300 }, fontWeight: 700, fontSize: "1.1rem" }}
        >
          전체 요금 변경사항 저장하기
        </Button>
      </Box>
    </Box>
  );
};

export default FeesBasic;