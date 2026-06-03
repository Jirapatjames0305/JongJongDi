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

export interface ProductImage { url: string; isMain: boolean; order: number }

export interface Product {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: number;
  oldPrice: number | null;
  unitLabel: string | null;
  location: string | null;
  deliveryNote: string | null;
  badge: string | null;
  isActive: boolean;
  images: ProductImage[];
}

export interface RoomFilters { q?: string; checkIn?: string; checkOut?: string }

export async function listRooms(filters: RoomFilters = {}): Promise<Room[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.checkIn) params.set("checkIn", filters.checkIn);
  if (filters.checkOut) params.set("checkOut", filters.checkOut);
  const qs = params.toString();
  const res = await fetch(`${API}/api/rooms${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getRoom(slug: string): Promise<Room | null> {
  const res = await fetch(`${API}/api/rooms/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export interface RoomAvailability { unavailable: string[]; totalQuantity: number }

export async function getRoomAvailability(slug: string, month: string): Promise<RoomAvailability> {
  const res = await fetch(`${API}/api/rooms/${slug}/availability?month=${month}`, { cache: "no-store" });
  if (!res.ok) return { unavailable: [], totalQuantity: 0 };
  return res.json();
}

export interface TourFilters { q?: string; date?: string }

export async function listTours(filters: TourFilters = {}): Promise<Tour[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.date) params.set("date", filters.date);
  const qs = params.toString();
  const res = await fetch(`${API}/api/tours${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getTour(slug: string): Promise<Tour | null> {
  const res = await fetch(`${API}/api/tours/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API}/api/products`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API}/api/products/${slug}`, { cache: "no-store" });
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

export interface TrendingCard {
  id: string;
  kind: "ROOM" | "TOUR" | "PRODUCT";
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  oldPrice: number | null;
  location: string | null;
  badge: string | null;
  unitLabel: string | null;
  deliveryNote: string | null;
  ctaLabel: string;
  link: string;
}

export async function listTrending(): Promise<TrendingCard[]> {
  const res = await fetch(`${API}/api/trending`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export function mainImageUrl(images: { url: string; isMain: boolean }[] | undefined): string | null {
  if (!images?.length) return null;
  return (images.find((i) => i.isMain) ?? images[0]).url;
}
