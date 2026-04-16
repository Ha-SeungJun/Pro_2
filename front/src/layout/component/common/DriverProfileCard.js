import React from "react";
import {
  Box,
  Typography,
  Rating,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar,
  LinearProgress,
} from "@mui/material";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8080";

const DEFAULT_AVATAR = "/image/placeholders/avatar.svg";

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith("http")) return v;
  if (v.startsWith("/g2i4/uploads/")) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

const ratingRows = [
  { key: "five", value: 5, label: "5점" },
  { key: "four", value: 4, label: "4점" },
  { key: "three", value: 3, label: "3점" },
  { key: "two", value: 2, label: "2점" },
  { key: "one", value: 1, label: "1점" },
];

const DriverProfileCard = ({
  title = "프로필",
  profileInfo,
  summary,
  verification,
  reviewStats,
  showVerifyButton = false,
  verifyButtonLoading = false,
  onVerifyClick,
}) => {
  const avatarUrl = normalizeProfileUrl(profileInfo?.avatarUrl);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #e5e7eb",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
      }}
    >
      <CardContent sx={{ px: 4, py: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          {title}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              src={avatarUrl || DEFAULT_AVATAR}
              alt={profileInfo?.name || "프로필"}
              sx={{
                width: 88,
                height: 88,
                border: "2px solid #e5e7eb",
                mb: 1.2,
              }}
              imgProps={{
                referrerPolicy: "no-referrer",
                crossOrigin: "anonymous",
                onError: (e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                },
              }}
            />

            {showVerifyButton ? (
              <Button
                variant={verification?.isVerified ? "contained" : "outlined"}
                color={verification?.isVerified ? "success" : "primary"}
                disabled={verification?.isVerified || verifyButtonLoading}
                onClick={onVerifyClick}
                sx={{ mb: 1.5 }}
              >
                {verifyButtonLoading
                  ? "인증 진행 중..."
                  : verification?.isVerified
                    ? "✔ 인증 완료"
                    : "본인 인증하기"}
              </Button>
            ) : (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={verification?.isVerified ? "success.main" : "text.secondary"}
                >
                  {verification?.isVerified ? "✔ 본인인증 완료" : "미인증"}
                </Typography>
              </Box>
            )}

            <Typography variant="subtitle1" fontWeight="bold">
              {profileInfo?.name || profileInfo?.id || "차주"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {profileInfo?.id || "-"}
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ lineHeight: 1, mb: 1 }}
            >
              {Number(summary?.avgRating || 0).toFixed(1)}
            </Typography>

            <Rating
              value={Number(summary?.avgRating || 0)}
              precision={0.5}
              readOnly
              sx={{ mb: 1 }}
            />

            <Typography variant="body1" color="text.secondary">
              총 리뷰 수 {Number(summary?.reviewCount || 0)}개
            </Typography>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" } }}
          />

          <Box sx={{ flex: 1.4, width: "100%" }}>
            <Stack spacing={1.2}>
              {ratingRows.map(({ key, value, label }) => {
                const count = Number(reviewStats?.[key] || 0);
                const total = Number(reviewStats?.total || 0);
                const percent = total > 0 ? (count / total) * 100 : 0;

                return (
                  <Box
                    key={key}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "56px 84px 1fr 42px",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {label}
                    </Typography>

                    <Rating value={value} readOnly size="small" />

                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#e5e7eb",
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="right"
                    >
                      {count}개
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DriverProfileCard;