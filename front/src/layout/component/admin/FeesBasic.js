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
        /* 자식에게 setLoading 함수를 props로 전달 */
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

  const fetchFull = useCallback(async () => {
    setError("");
    try {
      const res = await fetchFeesBasicFull();
      const data = res?.data || {};
      
      // 🚨 [추가] 새로운 데이터를 받기 전 기존 grid 메모리를 비워서 잔상 데이터 방지
      setGrid([]); 
      
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
        // 백엔드 FeesBasicDTO 구조와 완벽 일치
        const payload = {
          weight: String(rows[i] || "").trim(),
          ratePerKm: Number(grid[i]?.[0]) || 0,
          initialCharge: Number(grid[i]?.[1]) || 0,
          cargoName: "미지정"
        };

        console.log(`[전송 데이터 확인]:`, payload);
        await saveFeeBasicCell(payload);
      }

      await fetchFull();
      alert("전체 요금표 저장 성공!");
    } catch (e) {
      console.error(" 400 에러 상세 내용:", e.response?.data);
      alert(`저장 실패 (400): 서버가 데이터를 거절했습니다.`);
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
    
    // 🚨 [추가] 삭제 작업 시작 시 로딩 표시
    setLoading(true);

    try {
      await deleteBasicRow(key);
      
      // 🚨 [추가] 삭제 후 잔상이 남지 않도록 grid 초기화 후 리로드
      setGrid([]); 
      await fetchFull();
      
    } catch (e) { 
      alert("행 삭제 실패"); 
    } finally {
      // 🚨 [추가] 작업 종료 후 로딩 해제
      setLoading(false);
    }
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