// Mock data used across the admin UI.

export type OrderStatus = "placed" | "confirmed" | "processing" | "shipping" | "delivered" | "cancelled";
export type PaymentMethod = "UPI" | "Card" | "COD" | "Wallet";
export type KycStatus = "pending" | "approved" | "rejected";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  basePrice: number;
  variants: number;
  stock: number;
  image: string;
  isHot: boolean;
  isTrending: boolean;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  payment: PaymentMethod;
  paymentStatus: "paid" | "pending" | "failed";
  status: OrderStatus;
}

export interface Affiliate {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  clicks: number;
  conversions: number;
  earningsPending: number;
  earningsPaid: number;
  kyc: KycStatus;
  joinDate: string;
  active: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  orders: number;
  spent: number;
  wallet: number;
  role: "Admin" | "Manager" | "Support" | "User";
  active: boolean;
}

export interface KycRequest {
  id: string;
  affiliateName: string;
  phone: string;
  submittedAt: string;
  idProof: string;
  addressProof: string;
}

const productNames = [
  "Arduino Uno R3", "Raspberry Pi 5 8GB", "ESP32 DevKit V1", "NodeMCU ESP8266",
  "ATL Robotics Starter Kit", "Servo Motor SG90", "Ultrasonic Sensor HC-SR04",
  "DHT22 Temp Sensor", "16x2 LCD Display", "Breadboard 830pt",
  "Jumper Wires Pack", "L298N Motor Driver", "MPU6050 Gyroscope",
  "RFID Reader RC522", "OLED 0.96\" Display",
];

const categories = ["Microcontrollers", "Sensors", "ATL Kits", "Modules", "Accessories"];
const brands = ["Arduino", "Raspberry Pi", "Espressif", "DSM Originals", "Generic"];

export const products: Product[] = productNames.map((name, i) => ({
  id: `PRD-${1000 + i}`,
  name,
  sku: `SKU-${String(2000 + i)}`,
  category: categories[i % categories.length],
  brand: brands[i % brands.length],
  basePrice: 199 + ((i * 137) % 4800),
  variants: 1 + (i % 4),
  stock: (i * 7) % 50,
  image: "",
  isHot: i % 3 === 0,
  isTrending: i % 4 === 0,
  isAvailable: i % 7 !== 0,
}));

const customers = ["Ravi Kumar", "Priya Sharma", "Aman Verma", "Sneha Patel", "Karthik Iyer", "Neha Singh", "Rahul Das", "Ishita Roy"];
const statuses: OrderStatus[] = ["placed", "confirmed", "processing", "shipping", "delivered", "cancelled"];
const methods: PaymentMethod[] = ["UPI", "Card", "COD", "Wallet"];

export const orders: Order[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `ORD-${10234 + i}`,
  customer: customers[i % customers.length],
  date: new Date(Date.now() - i * 36e5 * 6).toISOString(),
  items: 1 + (i % 5),
  total: 499 + ((i * 211) % 9500),
  payment: methods[i % methods.length],
  paymentStatus: i % 6 === 0 ? "pending" : i % 11 === 0 ? "failed" : "paid",
  status: statuses[i % statuses.length],
}));

export const affiliates: Affiliate[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `AFF-${500 + i}`,
  name: customers[i % customers.length] + " " + (i + 1),
  phone: `9${String(800000000 + i * 12345).slice(0, 9)}`,
  referralCode: `DSM${(1000 + i).toString(36).toUpperCase()}`,
  clicks: 50 + ((i * 73) % 900),
  conversions: 2 + ((i * 13) % 60),
  earningsPending: ((i * 311) % 8000),
  earningsPaid: ((i * 547) % 25000),
  kyc: i % 3 === 0 ? "pending" : i % 5 === 0 ? "rejected" : "approved",
  joinDate: new Date(Date.now() - i * 86400000 * 4).toISOString(),
  active: i % 6 !== 0,
}));

export const users: UserAccount[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `USR-${2000 + i}`,
  name: customers[i % customers.length],
  phone: `9${String(700000000 + i * 76543).slice(0, 9)}`,
  email: `${customers[i % customers.length].toLowerCase().replace(" ", ".")}@mail.com`,
  joinDate: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  orders: i * 2,
  spent: ((i * 911) % 45000),
  wallet: ((i * 233) % 3500),
  role: (["User", "User", "User", "Support", "Manager", "Admin"] as const)[i % 6],
  active: i % 8 !== 0,
}));

export const kycRequests: KycRequest[] = affiliates
  .filter((a) => a.kyc === "pending")
  .map((a) => ({
    id: `KYC-${a.id}`,
    affiliateName: a.name,
    phone: a.phone,
    submittedAt: a.joinDate,
    idProof: "aadhaar.pdf",
    addressProof: "utility-bill.pdf",
  }));

export const revenueTrend = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  revenue: 25000 + Math.round(Math.sin(i / 3) * 8000 + i * 600 + Math.random() * 4000),
}));

export const orderStatusDist = [
  { name: "Delivered", value: 142, color: "var(--chart-3)" },
  { name: "Processing", value: 56, color: "var(--chart-1)" },
  { name: "Shipping", value: 38, color: "var(--chart-2)" },
  { name: "Pending", value: 22, color: "var(--chart-4)" },
  { name: "Cancelled", value: 9, color: "var(--chart-5)" },
];

export const topSelling = products.slice(0, 8).map((p, i) => ({
  name: p.name,
  sold: 120 - i * 11 + (i * 7) % 13,
}));

export const paymentSplit = [
  { name: "UPI", value: 52, color: "var(--chart-1)" },
  { name: "Card", value: 23, color: "var(--chart-2)" },
  { name: "COD", value: 16, color: "var(--chart-4)" },
  { name: "Wallet", value: 9, color: "var(--chart-3)" },
];

export const inrFormat = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
