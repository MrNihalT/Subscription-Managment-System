export type UserRole = "admin" | "staff" | "customer";

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface Customer {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  priceAdjustment: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  productType: "subscription" | "one_time" | "addon";
  salesPrice: number;
  costPrice: number;
  notes: string;
  active: boolean;
  createdAt: string;
  variants?: ProductVariant[];
}

export type BillingInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface Plan {
  id: string;
  productId: string;
  name: string;
  price: number;
  billingInterval: BillingInterval;
  minimumQuantity: number;
  availableFrom?: string;
  availableUntil?: string;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenewal: boolean;
  active: boolean;
  createdAt: string;
}

export type SubscriptionStatus =
  | "draft"
  | "quotation"
  | "confirmed"
  | "active"
  | "paused"
  | "closed";

export interface SubscriptionLine {
  id: string;
  subscriptionId: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate?: string;
  paymentTerms: string;
  linesTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: string;
}

export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  periodStart: string;
  periodEnd: string;
  status: InvoiceStatus;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  dueDate?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  method: "bank_transfer" | "credit_card" | "check" | "cash";
  amount: number;
  paidAt: string;
  note: string;
  createdAt: string;
}
