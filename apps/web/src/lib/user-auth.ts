const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
}

export async function userRegister(data: { name: string; phone: string; email?: string; password: string }) {
  const res = await fetch(`${API}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "สมัครสมาชิกไม่สำเร็จ");
  return json as { token: string; user: UserInfo };
}

export async function userLogin(phone: string, password: string) {
  const res = await fetch(`${API}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "เข้าสู่ระบบไม่สำเร็จ");
  return json as { token: string; user: UserInfo };
}

export function saveUserSession(token: string, user: UserInfo) {
  localStorage.setItem("jjd_user_token", token);
  localStorage.setItem("jjd_user", JSON.stringify(user));
}

export function getUserSession(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem("jjd_user");
  return s ? JSON.parse(s) : null;
}

export function clearUserSession() {
  localStorage.removeItem("jjd_user_token");
  localStorage.removeItem("jjd_user");
}
