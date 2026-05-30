import type { Supplier, Ingredient } from "../types";

export const mockSuppliers: Supplier[] = [
  { id: "sup-1", name: "Công ty TNHH Bia Sài Gòn", phone: "028 3825 6868", address: "Quận 1, TP.HCM" },
  { id: "sup-2", name: "Nhà cung cấp đồ ăn Minh Anh", phone: "090 123 4567", address: "Quận Tân Bình, TP.HCM" },
  { id: "sup-3", name: "Cửa hàng thực phẩm Phát Đạt", phone: "091 234 5678", address: "Quận Bình Thạnh, TP.HCM" },
  { id: "sup-4", name: "Công ty Thực phẩm Hải Sản Tươi Sống", phone: "092 345 6789", address: "Quận 7, TP.HCM" },
];

export const mockIngredients: Ingredient[] = [
  { id: "ing-1", name: "Bia hơi (Thùng 50L)", unit: "chai", currentStock: 25, minStock: 10, hasExpiry: true },
  { id: "ing-2", name: "Bia lon Sài Gòn", unit: "lon", currentStock: 150, minStock: 50, hasExpiry: true },
  { id: "ing-3", name: "Bia chai Heineken", unit: "chai", currentStock: 80, minStock: 30, hasExpiry: true },
  { id: "ing-4", name: "Đậu phộng rang", unit: "kg", currentStock: 12, minStock: 5, hasExpiry: false },
  { id: "ing-5", name: "Khô bò", unit: "kg", currentStock: 8, minStock: 3, hasExpiry: true },
  { id: "ing-6", name: "Mực khô xé", unit: "kg", currentStock: 5, minStock: 2, hasExpiry: true },
  { id: "ing-7", name: "Chả ram tôm đất", unit: "kg", currentStock: 10, minStock: 5, hasExpiry: true },
  { id: "ing-8", name: "Nem chua rán", unit: "gói", currentStock: 20, minStock: 10, hasExpiry: true },
  { id: "ing-9", name: "Đá viên", unit: "kg", currentStock: 50, minStock: 20, hasExpiry: false },
  { id: "ing-10", name: "Muối ớt xanh", unit: "kg", currentStock: 3, minStock: 1, hasExpiry: false },
  { id: "ing-11", name: "Nước mắm", unit: "lít", currentStock: 15, minStock: 5, hasExpiry: true },
  { id: "ing-12", name: "Dầu ăn", unit: "lít", currentStock: 20, minStock: 8, hasExpiry: false },
  { id: "ing-13", name: "Hành tím", unit: "kg", currentStock: 4, minStock: 2, hasExpiry: true },
  { id: "ing-14", name: "Tỏi", unit: "kg", currentStock: 3, minStock: 1, hasExpiry: true },
  { id: "ing-15", name: "Ớt", unit: "kg", currentStock: 2, minStock: 1, hasExpiry: true },
];
