import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, CircularProgress, Button, TextField,
  IconButton, Stack, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchFeesExtraFull,
  saveFeeExtraCell,
  addExtraRow,
  deleteExtraRow,
} from "../../../api/adminApi/adminApi";

const thStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center", backgroundColor: "#f5f5f5" };
const tdStyle = { border: "1px solid #ccc", padding: "4px", textAlign: "center" };
const inputStyle = { width: "100px", textAlign: "center", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" };

const FeesExtra = () => {
  const [loading, setLoading] = useState(false);
  return (
    <Box flexGrow={1} p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>추가요금</Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : (
        <FeesExtraTable />
      )}
    </Box>
  );
};

const FeesExtraTable = () => {
  const [columns, setColumns] = useState(["추가요금"]);
  const [rows, setRows] = useState([]);
  const [grid, setGrid] = useState([]);
  const [newRow, setNewRow] = useState("");
  const [error, setError] = useState("");

  const fetchFull = useCallback(async () => {
    setError("");
    try {
      const res = await fetchFeesExtraFull();
      const data = res?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setColumns(Array.isArray(data.columns) ? data.columns : ["추가요금"]);
      setGrid(Array.isArray(data.grid) ? data.grid : []);
    } catch (e) {
      console.error("[extra/full] failed:", e?.response?.status, e?.response?.data || e.message);
      setError("추가요금 데이터를 불러오지 못했습니다.");
      setRows([]); setGrid([]);
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

  const handleSave = async (rowIdx, colIdx) => {
    try {
      await saveFeeExtraCell({
        category: rows[rowIdx],
        distance: columns[colIdx],
        price: Number(grid[rowIdx]?.[colIdx] || 0),
      });
      await fetchFull();
      alert("저장 성공");
    } catch (e) {
      console.error("[save extra] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("저장 실패");
    }
  };

  const onAddRow = async () => {
    const name = newRow.trim();
    if (!name) return;
    try {
      await addExtraRow(name);
      setNewRow("");
      await fetchFull();
    } catch (e) {
      console.error("[add extra row] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("행 추가 실패");
    }
  };

  const onDeleteRow = async (name) => {
    const key = (name || "").trim();
    if (!key) return;
    if (!window.confirm(`'${key}' 행을 삭제하시겠습니까?`)) return;
    try {
      await deleteExtraRow(key); // 쿼리스트링 방식 (title 파라미터)
      await fetchFull();
    } catch (e) {
      console.error("[delete extra row] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("행 삭제 실패");
    }
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="새 항목 (예: 파손주의)"
          value={newRow}
          onChange={(e)=>setNewRow(e.target.value)}
          sx={{ width: 240 }}
        />
        <Button variant="contained" onClick={onAddRow}>행 추가</Button>
      </Stack>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={thStyle}>항목</th>
            {(Array.isArray(columns) ? columns : []).map((col, idx) => (
              <th key={idx} style={thStyle}>{col}</th>
            ))}
            <th style={thStyle}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(rows) ? rows : []).map((rowLabel, rowIdx) => (
            <tr key={rowLabel}>
              <th style={thStyle}>{rowLabel}</th>
              {(Array.isArray(columns) ? columns : []).map((_, colIdx) => (
                <td key={`${rowLabel}-${colIdx}`} style={tdStyle}>
                  <input
                    type="text"
                    value={grid[rowIdx]?.[colIdx] ?? ""}
                    onChange={(e)=>handleChange(rowIdx, colIdx, e.target.value)}
                    style={inputStyle}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>handleSave(rowIdx, colIdx)}
                    style={{ marginLeft: 8 }}
                  >
                    저장
                  </Button>
                </td>
              ))}
              <td style={tdStyle}>
                <IconButton color="error" onClick={()=>onDeleteRow(rowLabel)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
          {(Array.isArray(rows) ? rows : []).length === 0 && (
            <tr><td colSpan={(columns?.length ?? 1) + 2} style={tdStyle}>행이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeesExtra;
