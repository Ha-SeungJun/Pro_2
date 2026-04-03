import axios from "axios";
import { API_SERVER_HOST } from "../serverConfig";

const PREFIX = `${API_SERVER_HOST}/g2i4/admin/reports`;

export async function fetchReports({ status, keyword, searchType, page = 0, size = 10, sort = "createdAt,desc" }) {
  const { data } = await axios.get(PREFIX, {
    params: { status, keyword, searchType, page, size, sort },
    withCredentials: false,
  });
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await axios.get(`${PREFIX}/unread-count`, { withCredentials: false });
  return data;
}

export async function markReportRead(id, read) {
    await axios.put(`${PREFIX}/${id}/read?read=${read}`, null, {
        withCredentials: true,
    });
}

export async function resolveReport(id, note) {
  await axios.post(`${PREFIX}/${id}/resolve`, null, { params: { note } });
}

export async function rejectReport(id, note) {
  await axios.post(`${PREFIX}/${id}/reject`, null, { params: { note } });
}