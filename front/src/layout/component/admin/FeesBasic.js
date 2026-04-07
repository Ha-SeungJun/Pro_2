// src/pages/admin/FeesBasic.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress, Button, TextField, IconButton, Stack, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchFeesBasicFull, saveFeeBasicCell, addBasicRow, deleteBasicRow } from "../../../api/adminApi/adminApi";

const thStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center", backgroundColor: "#f5f5f5" };
const tdStyle = { border: "1px solid #ccc", padding: "4px", textAlign: "center" };
const inputStyle = { width: "100px", textAlign: "center", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" };

const FeesBasic = () => {
  const [loading, setLoading] = useState(false);

  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>기본요금</Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        /* 1. [수정] 자식에게 setLoading 함수를 props로 전달합니다 */
        <FeesBasicTable setLoading={setLoading} />
      )}
    </Box>
  );
};

/* 2. [수정] 자식 컴포넌트 매개변수에서 { setLoading }을 구조 분해 할당으로 받습니다 */
const FeesBasicTable = ({ setLoading }) => {
  const [columns, setColumns] = useState(["거리별 요금", "기본 요금"]);
  const [rows, setRows] = useState([]);
  const [grid, setGrid] = useState([]);
  const [newRow, setNewRow] = useState("");
  const [error, setError] = useState("");

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
        // 7급 전산직 실무: 백엔드 FeesBasicDTO 구조와 완벽 일치시킴
        const payload = {
          weight: String(rows[i] || "").trim(),    // DTO: String weight
          ratePerKm: Number(grid[i]?.[0]) || 0,    // DTO: BigDecimal ratePerKm (K 대문자!)
          initialCharge: Number(grid[i]?.[1]) || 0, // DTO: BigDecimal initialCharge (C 대문자!)
          cargoName: "미지정"                       // DTO: String cargoName
        };

        console.log(`[전송 데이터 확인]:`, payload);

        await saveFeeBasicCell(payload);
      }

      await fetchFull();
      alert("전체 요금표 저장 성공!");
    } catch (e) {
      console.error(" 400 에러 상세 내용:", e.response?.data);
      alert(`저장 실패 (400): 서버가 데이터를 거절했습니다.\n콘솔(F12)의 'Network' 탭 응답을 확인해주세요.`);
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
    <div style={{ overflowX: "auto" }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TextField size="small" placeholder="새 중량 (예: 7톤)" value={newRow}
          onChange={(e) => setNewRow(e.target.value)} sx={{ width: 200 }} />
        <Button variant="contained" onClick={onAddRow}>행 추가</Button>
      </Stack>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
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

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSaveAll}
          sx={{ width: 300, fontWeight: 700, fontSize: "1.1rem" }}
        >
          전체 요금 변경사항 저장하기
        </Button>
      </Box>
    </div>
  );
};

export default FeesBasic;