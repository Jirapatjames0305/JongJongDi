export const BookingType = {
  ACCOMMODATION: "ACCOMMODATION",
  DIVE_TOUR: "DIVE_TOUR",
} as const;
export type BookingType = (typeof BookingType)[keyof typeof BookingType];

export const BookingStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING_CONFIRM: "PENDING_CONFIRM",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  NO_SHOW: "NO_SHOW",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  BANK_TRANSFER: "BANK_TRANSFER",
  PROMPTPAY: "PROMPTPAY",
  CREDIT_CARD: "CREDIT_CARD",
  ALIPAY: "ALIPAY",
  WECHAT_PAY: "WECHAT_PAY",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const UserRole = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const BookingStatusLabel: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "รอชำระเงิน",
  PENDING_CONFIRM: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  CHECKED_IN: "เช็คอินแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
  REFUNDED: "คืนเงินแล้ว",
  NO_SHOW: "ไม่มาใช้บริการ",
};
