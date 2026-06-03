const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface RoomImage { url: string; isMain: boolean; order: number }
export interface TourImage { url: string; isMain: boolean; order: number }

export interface RoomType {
  id: string;
  nameTh: string;
  nameEn: string;
  pricePerNight: number;
  maxGuests: number;
  quantity: number;
  order: number;
}

export interface Room {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  isActive: boolean;
  images: RoomImage[];
  types: RoomType[];
}

export interface TourSchedule {
  id: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
}

export interface Tour {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  pricePerPerson: number;
  maxSeats: number;
  durationHours: number;
  isActive: boolean;
  images: TourImage[];
  schedules?: TourSchedule[];
}

export async function listRooms(): Promise<Room[]> {
  const res = await fetch(`${API}/api/rooms`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getRoom(slug: string): Promise<Room | null> {
  const res = await fetch(`${API}/api/rooms/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function listTours(): Promise<Tour[]> {
  const res = await fetch(`${API}/api/tours`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getTour(slug: string): Promise<Tour | null> {
  const res = await fetch(`${API}/api/tours/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export interface CreateBookingInput {
  type: "ACCOMMODATION" | "DIVE_TOUR";
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  numGuests: number;
  paymentMethod: "BANK_TRANSFER" | "PROMPTPAY" | "CREDIT_CARD" | "ALIPAY" | "WECHAT_PAY";
  roomTypeId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  tourScheduleId?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<{ bookingNumber: string; totalAmount: number }> {
  const res = await fetch(`${API}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : "จองไม่สำเร็จ กรุณาตรวจสอบข้อมูล";
    throw new Error(msg);
  }
  return data;
}

export function mainImageUrl(images: { url: string; isMain: boolean }[] | undefined): string | null {
  if (!images?.length) return null;
  return (images.find((i) => i.isMain) ?? images[0]).url;
}
