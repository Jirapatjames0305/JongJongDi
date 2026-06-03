import { createHash } from "crypto";

// ─── ChillPay Payment Gateway (hosted redirect / form POST, v3) ────────────────
//
// ⚠️  CONFIRM-AGAINST-DOCS: the four things below are version/account specific.
//     Verify them against your ChillPay integration document, then adjust here only:
//       1. PAYMENT_URL          — sandbox vs production endpoint
//       2. CHANNEL_CODE map     — the ChannelCode string for each payment method
//       3. requestChecksum()    — exact field order used to build the MD5
//       4. verifyNotifyChecksum() — field order ChillPay uses for the notify CheckSum
//
// Read env lazily (not at import time) — dotenv loads .env after this module is imported.
function cfg() {
  return {
    merchantCode: process.env.CHILLPAY_MERCHANT_CODE ?? "",
    apiKey: process.env.CHILLPAY_API_KEY ?? "",
    md5Secret: process.env.CHILLPAY_MD5_SECRET ?? "",
    // (1) endpoint — switch to https://cdn.chillpay.co/Payment/ for production
    paymentUrl: process.env.CHILLPAY_PAYMENT_URL ?? "https://sandbox-cdn.chillpay.co/Payment/",
  };
}

export function isChillpayEnabled(): boolean {
  const c = cfg();
  return Boolean(c.merchantCode && c.apiKey && c.md5Secret);
}

export function getChillpayPaymentUrl(): string {
  return cfg().paymentUrl;
}

// (2) Our PaymentMethod → ChillPay ChannelCode. Confirm each code against docs.
export const CHANNEL_CODE: Record<string, string> = {
  PROMPTPAY: "promptpay",
  CREDIT_CARD: "creditcard",
  ALIPAY: "alipay",
  WECHAT_PAY: "wechat",
};

export interface ChillpayRequest {
  orderNo: string;        // our unique reference (stored as Payment.chillpayOrderNo)
  customerId: string;
  amount: number;         // in satang (THB * 100), integer, no decimals
  phoneNumber: string;
  description: string;
  channelCode: string;
  returnUrl: string;      // browser redirect after payment
  notifyUrl: string;      // server-to-server background notification
  customerName?: string;
  customerEmail?: string;
  ipAddress?: string;
}

export interface ChillpayFormPayload {
  url: string;
  fields: Record<string, string>;
}

// Build the auto-submit form payload the browser POSTs to ChillPay's hosted page.
export function buildPaymentForm(req: ChillpayRequest): ChillpayFormPayload {
  const c = cfg();
  const fields: Record<string, string> = {
    MerchantCode: c.merchantCode,
    OrderNo: req.orderNo,
    CustomerId: req.customerId,
    Amount: String(req.amount),
    PhoneNumber: req.phoneNumber,
    Description: req.description,
    ChannelCode: req.channelCode,
    Currency: "764", // THB
    LangCode: "TH",
    RouteNo: "1",
    IPAddress: req.ipAddress ?? "",
    ApiKey: c.apiKey,
    CustomerName: req.customerName ?? "",
    CustomerEmail: req.customerEmail ?? "",
    ReturnUrl: req.returnUrl,
    NotifyUrl: req.notifyUrl,
  };
  fields.CheckSum = requestChecksum(fields);
  return { url: c.paymentUrl, fields };
}

// (3) Request CheckSum — concatenate fields in the documented order + MD5 secret.
function requestChecksum(f: Record<string, string>): string {
  const raw =
    f.MerchantCode +
    f.OrderNo +
    f.CustomerId +
    f.Amount +
    f.PhoneNumber +
    f.Description +
    f.ChannelCode +
    f.Currency +
    f.LangCode +
    f.RouteNo +
    f.IPAddress +
    f.ApiKey +
    f.CustomerName +
    f.CustomerEmail +
    f.ReturnUrl +
    f.NotifyUrl +
    cfg().md5Secret;
  return createHash("md5").update(raw, "utf8").digest("hex");
}

// Shape of the background notification ChillPay POSTs to NotifyUrl.
export interface ChillpayNotify {
  TransactionId?: string;
  Amount?: string;
  OrderNo?: string;
  CustomerId?: string;
  Status?: string; // "0" = success (confirm code in docs)
  CheckSum?: string;
  [k: string]: string | undefined;
}

// (4) Verify the notify CheckSum so we only trust genuine ChillPay callbacks.
export function verifyNotifyChecksum(n: ChillpayNotify): boolean {
  const raw =
    (n.TransactionId ?? "") +
    (n.Amount ?? "") +
    (n.OrderNo ?? "") +
    (n.CustomerId ?? "") +
    (n.Status ?? "") +
    cfg().md5Secret;
  const expected = createHash("md5").update(raw, "utf8").digest("hex");
  return expected.toLowerCase() === String(n.CheckSum ?? "").toLowerCase();
}

// Treat this notify Status as a successful payment. Confirm the success code in docs.
export function isNotifySuccess(n: ChillpayNotify): boolean {
  return String(n.Status ?? "") === "0";
}
