const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface OperatorInfo {
  id: string;
  email: string;
  name: string;
  businessName: string;
  role: "SUPER_ADMIN" | "OPERATOR";
  status?: "PENDING" | "ACTIVE" | "SUSPENDED";
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
  return data as { token: string; operator: OperatorInfo };
}

export async function registerApi(payload: {
  email: string;
  password: string;
  name: string;
  businessName: string;
  phone: string;
}) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "สมัครไม่สำเร็จ");
  return data as { token: string; operator: OperatorInfo; message: string };
}

export async function fetchOperators(token: string, status?: string) {
  const url = `${API}/api/operators${status ? `?status=${status}` : ""}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function approveOperator(token: string, id: string, status: string) {
  const res = await fetch(`${API}/api/operators/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function updateOperatorCommission(token: string, id: string, commissionRate: number) {
  const res = await fetch(`${API}/api/operators/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ commissionRate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "บันทึกค่าคอมไม่สำเร็จ");
  return data;
}

export async function fetchStats(token: string) {
  const res = await fetch(`${API}/api/operators/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function changePasswordApi(token: string, currentPassword: string, newPassword: string) {
  const res = await fetch(`${API}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
  return data;
}

export async function fetchBookings(token: string, params?: { status?: string; type?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.type) q.set("type", params.type);
  if (params?.page) q.set("page", String(params.page));
  const res = await fetch(`${API}/api/bookings/admin/list?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("โหลดการจองไม่สำเร็จ");
  return res.json() as Promise<{ bookings: BookingRow[]; total: number; page: number }>;
}

export async function fetchBooking(token: string, bookingNumber: string) {
  const res = await fetch(`${API}/api/bookings/admin/${bookingNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("ไม่พบการจอง");
  return res.json() as Promise<BookingDetail>;
}

export async function updateBookingStatus(token: string, bookingNumber: string, status: string, internalNote?: string) {
  const res = await fetch(`${API}/api/bookings/admin/${bookingNumber}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, ...(internalNote !== undefined && { internalNote }) }),
  });
  if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
  return res.json();
}

export async function updatePaymentStatus(token: string, bookingNumber: string, status: "APPROVED" | "REJECTED") {
  const res = await fetch(`${API}/api/bookings/admin/${bookingNumber}/payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("อัปเดตสถานะชำระเงินไม่สำเร็จ");
  return res.json();
}

export async function fetchBlocks(token: string) {
  const res = await fetch(`${API}/api/availability/blocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createBlock(token: string, data: {
  targetType: "ROOM" | "TOUR";
  roomId?: string;
  tourId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  const res = await fetch(`${API}/api/availability/blocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("สร้าง block ไม่สำเร็จ");
  return res.json();
}

export async function deleteBlock(token: string, id: string) {
  const res = await fetch(`${API}/api/availability/blocks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("ลบ block ไม่สำเร็จ");
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingRow {
  id: string;
  bookingNumber: string;
  type: "ACCOMMODATION" | "DIVE_TOUR";
  status: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  numGuests: number;
  totalAmount: number;
  createdAt: string;
  room: { nameTh: string; slug: string } | null;
  tourSchedule: { tour: { nameTh: string; slug: string }; departureDate: string; departureTime: string } | null;
  payments: { status: string; method: string; amount: number }[];
}

export interface BookingDetail extends BookingRow {
  checkInDate: string | null;
  checkOutDate: string | null;
  internalNote: string | null;
  payments: {
    id: string;
    status: string;
    method: string;
    amount: number;
    slipUrl: string | null;
    createdAt: string;
  }[];
}
