// MainFeesUtil.jsx
import {
  Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, Typography, IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
import { postSearchFeesBasic } from "../../../api/estimateApi/estimateApi";
import { uploadImage } from "../../../api/common/mainImageAPI";
import { API_SERVER_HOST } from "../../../api/serverConfig"; // ✅ 서버 호스트

// ✅ 슬래시 중복 방지해서 URL 붙이기
const joinUrl = (base, path) =>
  `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

// ✅ /g2i4/uploads/.., /uploads/.., 파일명만 오는 경우 모두 처리
const normalizeUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  if (p.startsWith("/g2i4/uploads/")) return joinUrl(API_SERVER_HOST, p);
  if (p.startsWith("/uploads/")) {
    const fname = p.split("/").pop();
    return joinUrl(API_SERVER_HOST, `/g2i4/uploads/${fname}`);
  }
  return joinUrl(API_SERVER_HOST, `/g2i4/uploads/${p}`);
};

export default function MainFeesUtil({ open, onClose, onSuccess }) {
  const [options, setOptions] = useState([]); // [{tno, weight, cargoImage, ...}]
  const [loading, setLoading] = useState(false);
  const [hasLocalImage, setHasLocalImage] = useState(false); // ✅ 사용자가 파일을 올렸는지
  const [formData, setFormData] = useState({
    tno: "",
    image: null,
    preview: null,     // blob:... 또는 서버 이미지 절대 URL
  });

  // 모달 열릴 때 옵션 로드 + 폼 초기화
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await postSearchFeesBasic(); // or basicList()
        setOptions(list || []);
      } catch (e) {
        console.error("feesBasic 로드 실패", e);
      }
    })();
    // 초기화
    setHasLocalImage(false);
    setFormData({ tno: "", image: null, preview: null });
  }, [open]);

  // ✅ 차량 선택 시: 로컬 업로드가 없을 때는 서버에 저장된 이미지로 프리뷰 갱신
  const handleSelect = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      let nextPreview = prev.preview;
      if (!hasLocalImage) {
        const opt = options.find((o) => String(o.tno) === String(val));
        nextPreview = normalizeUrl(opt?.cargoImage) || null;
      }
      return { ...prev, tno: val, preview: nextPreview };
    });
  };

  // ✅ 파일 선택 시: 로컬 프리뷰로 교체 + flag 세팅
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // (선택) 용량 큰 경우 프론트에서 압축 후 올리고 싶으면 여기서 compressImage(file) 적용
    // const fileToUse = await compressImage(file, 1200, 800, 0.82, "image/webp");

    // 기존 blob URL 정리 (blob 인 경우에만)
    if (formData.preview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(formData.preview);
    }

    const url = URL.createObjectURL(file);
    setHasLocalImage(true);
    setFormData((prev) => ({ ...prev, image: file, preview: url }));
  };

  // 언마운트 시 Blob URL 해제
  useEffect(() => {
    return () => {
      if (formData.preview?.startsWith?.("blob:")) {
        URL.revokeObjectURL(formData.preview);
      }
    };
  }, [formData.preview]);

  const handleSave = async () => {
    if (!formData.tno) return alert("차량을 선택해주세요.");
    if (!formData.image) return alert("이미지를 업로드해주세요.");

    try {
      setLoading(true);
      const res = await uploadImage(formData.tno, formData.image);
      if (res?.status >= 200 && res.status < 300) {
        onSuccess?.(); // 부모가 fetchFees() 호출
      } else {
        alert("업로드에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!open} onClose={onClose}>
      <Box sx={{
        p: 4, bgcolor: '#fff', borderRadius: 2, width: '90%', maxWidth: 900, mx: 'auto', mt: '5%', position: 'relative'
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }} />
        <Typography variant="h6" mb={3}>차량 이미지 등록</Typography>

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
          {/* ⬅️ 미리보기: 선택한 차량의 기존 이미지 또는 로컬 프리뷰 */}
          <Box sx={{
            width: "100%",
            // 보기 좋은 프리뷰 크기로 제한
            maxWidth: 420,
            height: 260,
            bgcolor: "#eef1f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            overflow: "hidden"
          }}>
            <img
              src={
                formData.preview ||
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'
              }
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          {/* 우측 폼 */}
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <InputLabel id="vehicle-select-label">차량 선택</InputLabel>
              <Select
                labelId="vehicle-select-label"
                label="차량 선택"
                value={formData.tno}
                onChange={handleSelect}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.tno} value={opt.tno}>
                    {opt.weight} ({opt.tno})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" component="label">
              이미지 업로드
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>
          </Box>
        </Box>

        <Box mt={4} display="flex" gap={2}>
          <Button fullWidth variant="contained" disabled={loading} onClick={handleSave}>
            {loading ? "저장 중..." : "저장"}
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>취소</Button>
        </Box>
      </Box>
    </Modal>
  );
}
