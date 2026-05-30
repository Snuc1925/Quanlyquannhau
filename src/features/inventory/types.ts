export type IngredientUnit = "kg" | "lít" | "chai" | "lon" | "gói" | "cái";

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: IngredientUnit;
  currentStock: number;
  minStock: number;
  hasExpiry: boolean;
};

export type ReceiptLineItem = {
  ingredientId: string;
  quantity: number;
  unitPrice: number;
  expiryDate?: string;
  total: number;
};

export type StockReceipt = {
  id: string;
  supplierId: string;
  createdAt: string;
  createdBy: string;
  items: ReceiptLineItem[];
  grandTotal: number;
  status: "DRAFT" | "CONFIRMED";
};

export type StockMovement = {
  id: string;
  ingredientId: string;
  receiptId: string;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  timestamp: string;
};
