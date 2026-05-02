export type ProjectStatus = "ongoing" | "completed" | "hold";

export interface Customer {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  materials: string;
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  status: ProjectStatus;
  progress: number;
  delivery: string;
  amount: number;
}

export interface StockItem {
  id: string;
  material: string;
  type: string;
  quantity: number;
  unit: string;
}

export const customers: Customer[] = [
  { id: "C001", company: "Sterling Interiors", contact: "Rohit Mehta", phone: "9876543210", email: "rohit@sterling.in", address: "Andheri, Mumbai" },
  { id: "C002", company: "Urban Living Co.", contact: "Priya Shah", phone: "9988776655", email: "priya@urbanliving.in", address: "Koramangala, Bangalore" },
  { id: "C003", company: "Modular Spaces", contact: "Arjun Kapoor", phone: "9123456780", email: "arjun@modular.in", address: "Saket, Delhi" },
  { id: "C004", company: "Decor Hub", contact: "Neha Iyer", phone: "9012345678", email: "neha@decorhub.in", address: "T. Nagar, Chennai" },
];

export const vendors: Vendor[] = [
  { id: "V001", name: "Greenply Industries", contact: "9001112233", materials: "MDF, Plywood" },
  { id: "V002", name: "Century Laminates", contact: "9002223344", materials: "Laminates, Veneer" },
  { id: "V003", name: "Acrylic World", contact: "9003334455", materials: "Acrylic Sheets" },
  { id: "V004", name: "EdgeBand Pro", contact: "9004445566", materials: "Edge Banding Tape" },
];

export const projects: Project[] = [
  { id: "P001", name: "Sterling HQ Cabinets", customer: "Sterling Interiors", status: "ongoing", progress: 65, delivery: "2026-05-20", amount: 285000 },
  { id: "P002", name: "Urban Living Wardrobes", customer: "Urban Living Co.", status: "ongoing", progress: 40, delivery: "2026-06-10", amount: 540000 },
  { id: "P003", name: "Modular Kitchen — Saket", customer: "Modular Spaces", status: "completed", progress: 100, delivery: "2026-04-15", amount: 320000 },
  { id: "P004", name: "Decor Hub Showroom", customer: "Decor Hub", status: "hold", progress: 25, delivery: "2026-07-01", amount: 180000 },
  { id: "P005", name: "Sterling Boardroom", customer: "Sterling Interiors", status: "completed", progress: 100, delivery: "2026-03-28", amount: 410000 },
];

export const stock: StockItem[] = [
  { id: "S001", material: "MDF Sheet 18mm", type: "MDF", quantity: 120, unit: "sheets" },
  { id: "S002", material: "Plywood 19mm", type: "Plywood", quantity: 85, unit: "sheets" },
  { id: "S003", material: "Laminate — Walnut", type: "Laminate", quantity: 200, unit: "sheets" },
  { id: "S004", material: "Veneer — Teak", type: "Veneer", quantity: 60, unit: "sheets" },
  { id: "S005", material: "Acrylic — Glossy White", type: "Acrylic", quantity: 45, unit: "sheets" },
  { id: "S006", material: "Edge Band Tape 22mm", type: "Edge Band", quantity: 320, unit: "rolls" },
];

export const services = [
  { id: "lamination", label: "Lamination Pressing", rate: 180 },
  { id: "veneer", label: "Veneer Pressing", rate: 250 },
  { id: "acrylic", label: "Acrylic Pressing", rate: 320 },
  { id: "cutting", label: "Cutting", rate: 90 },
  { id: "edgeband", label: "Edge Banding", rate: 60 },
  { id: "boring", label: "Boring", rate: 75 },
];

export const revenueByMonth = [
  { month: "Nov", revenue: 380000 },
  { month: "Dec", revenue: 420000 },
  { month: "Jan", revenue: 510000 },
  { month: "Feb", revenue: 460000 },
  { month: "Mar", revenue: 580000 },
  { month: "Apr", revenue: 640000 },
];

export const projectsByStatus = [
  { name: "Ongoing", value: 2 },
  { name: "Completed", value: 2 },
  { name: "Hold", value: 1 },
];

export const transactions = [
  { id: "T001", date: "2026-04-28", desc: "Payment from Sterling Interiors", type: "credit", amount: 150000 },
  { id: "T002", date: "2026-04-26", desc: "Greenply Industries — MDF order", type: "debit", amount: 85000 },
  { id: "T003", date: "2026-04-22", desc: "Payment from Modular Spaces", type: "credit", amount: 320000 },
  { id: "T004", date: "2026-04-20", desc: "Century Laminates — Laminate stock", type: "debit", amount: 42000 },
  { id: "T005", date: "2026-04-18", desc: "Payment from Urban Living Co.", type: "credit", amount: 200000 },
  { id: "T006", date: "2026-04-15", desc: "Workshop electricity bill", type: "debit", amount: 18500 },
];
