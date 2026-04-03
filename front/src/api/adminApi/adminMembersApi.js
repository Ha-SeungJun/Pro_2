import { API_SERVER_HOST } from "../serverConfig";

const BASE = `${API_SERVER_HOST}/g2i4/admin/members`;

export const fetchMembers = async ({
  type = "ALL",
  page = 0,
  size = 10,
  sort = "memCreateidDateTime,desc",
  keyword = "",
  searchType = "",
} = {}) => {
  const params = new URLSearchParams({ type, page, size, sort });
  if (keyword && keyword.trim()) {
    params.append("keyword", keyword.trim());
  }
  if (searchType) {
    params.append("searchType", searchType);
  }

  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchMembers ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
};

