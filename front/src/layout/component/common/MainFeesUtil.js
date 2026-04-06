// MainFeesUtil.jsx
import {
  Box, Button, Modal, Typography, IconButton, TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { uploadImage } from "../../../api/common/mainImageAPI";
import { addBasicRow, deleteBasicRow } from "../../../api/adminApi/adminApi";
import { postSearchFeesBasic } from "../../../api/estimateApi/estimateApi";

export default function MainFeesUtil({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    image: null,
    preview: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formData.preview?.startsWith("blob:")) URL.revokeObjectURL(formData.preview);
    setFormData((prev) => ({ ...prev, image: file, preview: URL.createObjectURL(file) }));
  };

  const handleClose = () => {
    if (formData.preview?.startsWith("blob:")) URL.revokeObjectURL(formData.preview);
    setFormData({ weight: "", image: null, preview: null });
    onClose?.();
  };

const handleSave = async () => {
  const weight = formData.weight.trim();
  if (!weight) return alert("중량을 입력해주세요.");  // ← 먼저 체크

  try {
    setLoading(true);

    // 1. 행 추가 (cargoName 같이 전달)
    await addBasicRow(weight, formData.cargoName);  // ← 한 번만 호출

    // 2. 이미지가 있으면 방금 추가한 항목 찾아서 업로드
    if (formData.image) {
      const list = await postSearchFeesBasic();
      const matched = list.find((v) => v.weight === weight);
      if (matched) {
        await uploadImage(matched.tno, formData.image);
      }
    }

    onSuccess?.();
    handleClose();
    alert("차량 등록 완료");
  } catch (e) {
    console.error(e);
    alert("등록 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal open={!!open} onClose={handleClose}>
      <Box sx={{
        p: 4, bgcolor: "#fff", borderRadius: 2,
        width: "90%", maxWidth: 500,
        mx: "auto", mt: "10%", position: "relative"
      }}>
        <IconButton onClick={handleClose} sx={{ position: "absolute", top: 12, right: 12 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" mb={3}>차량 등록</Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="차량명"
            placeholder="예: 다마스, 라보"
            value={formData.cargoName || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, cargoName: e.target.value }))}
            fullWidth
          />
          <TextField
            label="중량"
            placeholder="예: 0.5톤, 1톤"
            value={formData.weight}
            onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
            fullWidth
          />

          {/* 이미지 미리보기 */}
          <Box sx={{
            width: "100%", height: 200, bgcolor: "#eef1f5",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 1, overflow: "hidden"
          }}>
            <img
              src={formData.preview ||
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="20" font-family="sans-serif">No Image</text></svg>'}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          <Button variant="outlined" component="label">
            이미지 업로드 (선택)
            <input hidden accept="image/*" type="file" onChange={handleImageChange} />
          </Button>
        </Box>

        <Box mt={4} display="flex" gap={2}>
          <Button fullWidth variant="contained" disabled={loading} onClick={handleSave}>
            {loading ? "등록 중..." : "등록"}
          </Button>
          <Button fullWidth variant="outlined" onClick={handleClose}>취소</Button>
        </Box>
      </Box>
    </Modal>
  );
}