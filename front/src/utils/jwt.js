export const parseJwt=(token) =>{
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}
export const hasRole=(token, role)=> {
  if (!token) return false;
  const payload = parseJwt(token);
  const roles = payload?.roles || payload?.authorities || [];
  return Array.isArray(roles) ? roles.includes(role) : roles === role;
}

export function getAccessToken() {
  return localStorage.getItem("accessToken") || "";
}