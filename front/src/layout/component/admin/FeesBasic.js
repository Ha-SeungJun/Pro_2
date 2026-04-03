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
        <FeesBasicTable />
      )}
    </Box>
  );
};

const FeesBasicTable = () => {
  const [columns, setColumns] = useState(["거리별 요금","기본 요금"]); // fallback
  const [rows, setRows] = useState([]);
  const [grid, setGrid] = useState([]);
  const [newRow, setNewRow] = useState("");
  const [error, setError] = useState("");

    const [vehicles, setVehicles] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
      tno: "",
      image: null,
      preview: null
    });
  

    

  const fetchFull = useCallback(async () => {
    setError("");
    try {
      const res = await fetchFeesBasicFull();
      const data = res?.data || {};
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setColumns(Array.isArray(data.columns) ? data.columns : ["거리별 요금","기본 요금"]);
      setGrid(Array.isArray(data.grid) ? data.grid : []);
    } catch (e) {
      console.error("[basic/full] failed:", e?.response?.status, e?.response?.data || e.message);
      setError("요금 데이터를 불러오지 못했습니다.");
      setRows([]); setGrid([]);
    }
  }, []);

  useEffect(() => { fetchFull(); }, [fetchFull]);

  const handleChange = (r,c,v) => {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      if (!next[r]) next[r] = [];
      next[r][c] = v;
      return next;
    });
  };

  const handleSave = async (rowIdx, colIdx) => {
    try {
      await saveFeeBasicCell({
        category: rows[rowIdx],
        distance: columns[colIdx],
        price: Number(grid[rowIdx]?.[colIdx] || 0),
      });
      await fetchFull();
      alert("저장 성공");
    } catch (e) {
      console.error("[save basic] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("저장 실패");
    }
  };

  const onAddRow = async () => {
    const name = newRow.trim();
    if (!name) return;
    try {
      await addBasicRow(name);
      setNewRow("");
      await fetchFull();
    } catch (e) {
      console.error("[add row] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("행 추가 실패");
    }
  };

  const onDeleteRow = async (name) => {
    const key = (name || "").trim();
    if (!key) return;
    if (!window.confirm(`'${key}' 행을 삭제하시겠습니까?`)) return;
    try {
      await deleteBasicRow(key);
      await fetchFull();
    } catch (e) {
      console.error("[delete row] failed:", e?.response?.status, e?.response?.data || e.message);
      alert("행 삭제 실패");
    }
  };

  return (
    <div style={{ overflowX:"auto" }}>
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <TextField size="small" placeholder="새 중량 (예: 7톤)" value={newRow}
                   onChange={(e)=>setNewRow(e.target.value)} sx={{ width: 200 }} />
        <Button variant="contained" onClick={onAddRow}>행 추가</Button>
      </Stack>

      <table style={{ borderCollapse:"collapse", width:"100%" }}>
        <thead>
          <tr>
            <th style={thStyle}>중량(톤수)</th>
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
                  <Button variant="contained" color="primary" onClick={()=>handleSave(rowIdx,colIdx)} style={{ marginLeft: 8 }}>
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
            <tr><td colSpan={(columns?.length ?? 2) + 2} style={tdStyle}>행이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeesBasic;