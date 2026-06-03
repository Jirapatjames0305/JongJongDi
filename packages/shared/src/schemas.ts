import { z } from "zod";

export const CreateBookingSchema = z.object({
  type: z.enum(["ACCOMMODATION", "DIVE_TOUR"]),
  guestName: z.string().min(2),
  guestPhone: z.string().regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง"),
  guestEmail: z.string().email("อีเมลไม่ถูกต้อง"),
  numGuests: z.number().int().min(1),
  // Accommodation
  roomTypeId: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  // Tour
  tourScheduleId: z.string().optional(),
  // Payment
  paymentMethod: z.enum(["BANK_TRANSFER", "PROMPTPAY", "CREDIT_CARD", "ALIPAY", "WECHAT_PAY"]),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const BookingLookupSchema = z.object({
  phone: z.string().regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง"),
});
export type BookingLookupInput = z.infer<typeof BookingLookupSchema>;

export const UpdateBookingStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PENDING_CONFIRM",
    "CONFIRMED",
    "CHECKED_IN",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
    "NO_SHOW",
  ]),
  internalNote: z.string().optional(),
});
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
