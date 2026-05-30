import { create } from "zustand";
import type {
  Supplier,
  Ingredient,
  ReceiptLineItem,
  StockReceipt,
  StockMovement,
} from "../types";
import { mockSuppliers, mockIngredients } from "../data/mockData";

type DraftReceipt = {
  supplierId: string | null;
  items: ReceiptLineItem[];
};

type InventoryState = {
  suppliers: Supplier[];
  ingredients: Ingredient[];
  receipts: StockReceipt[];
  movements: StockMovement[];
  draft: DraftReceipt;
};

type InventoryActions = {
  // Draft management
  setSupplier: (supplierId: string) => void;
  addItem: (ingredientId: string) => void;
  updateItem: (
    ingredientId: string,
    updates: Partial<Omit<ReceiptLineItem, "ingredientId" | "total">>
  ) => void;
  removeItem: (ingredientId: string) => void;
  clearDraft: () => void;

  // Receipt operations
  confirmReceipt: (createdBy: string) => StockReceipt;

  // Helpers
  getIngredientById: (id: string) => Ingredient | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
};

const initialDraft: DraftReceipt = {
  supplierId: null,
  items: [],
};

export const useInventoryStore = create<InventoryState & InventoryActions>(
  (set, get) => ({
    suppliers: mockSuppliers,
    ingredients: mockIngredients,
    receipts: [],
    movements: [],
    draft: initialDraft,

    setSupplier: (supplierId) => {
      set((state) => ({
        draft: { ...state.draft, supplierId },
      }));
    },

    addItem: (ingredientId) => {
      const { draft } = get();
      // Check if item already exists
      if (draft.items.some((it) => it.ingredientId === ingredientId)) {
        return;
      }
      const newItem: ReceiptLineItem = {
        ingredientId,
        quantity: 1,
        unitPrice: 0,
        expiryDate: undefined,
        total: 0,
      };
      set((state) => ({
        draft: {
          ...state.draft,
          items: [...state.draft.items, newItem],
        },
      }));
    },

    updateItem: (ingredientId, updates) => {
      set((state) => {
        const items = state.draft.items.map((item) => {
          if (item.ingredientId !== ingredientId) return item;
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        });
        return { draft: { ...state.draft, items } };
      });
    },

    removeItem: (ingredientId) => {
      set((state) => ({
        draft: {
          ...state.draft,
          items: state.draft.items.filter(
            (it) => it.ingredientId !== ingredientId
          ),
        },
      }));
    },

    clearDraft: () => {
      set({ draft: initialDraft });
    },

    confirmReceipt: (createdBy) => {
      const { draft, ingredients, receipts, movements } = get();

      if (!draft.supplierId || draft.items.length === 0) {
        throw new Error("Phiếu nhập chưa đầy đủ thông tin");
      }

      const receiptId = `rcpt-${Date.now()}`;
      const grandTotal = draft.items.reduce((sum, it) => sum + it.total, 0);

      const newReceipt: StockReceipt = {
        id: receiptId,
        supplierId: draft.supplierId,
        createdAt: new Date().toISOString(),
        createdBy,
        items: draft.items,
        grandTotal,
        status: "CONFIRMED",
      };

      // Update stock levels + create movements
      const updatedIngredients = [...ingredients];
      const newMovements: StockMovement[] = [];

      draft.items.forEach((item) => {
        const idx = updatedIngredients.findIndex(
          (ing) => ing.id === item.ingredientId
        );
        if (idx === -1) return;

        const ingredient = updatedIngredients[idx];
        const beforeStock = ingredient.currentStock;
        const afterStock = beforeStock + item.quantity;

        updatedIngredients[idx] = {
          ...ingredient,
          currentStock: afterStock,
        };

        newMovements.push({
          id: `mov-${Date.now()}-${item.ingredientId}`,
          ingredientId: item.ingredientId,
          receiptId,
          quantity: item.quantity,
          beforeStock,
          afterStock,
          timestamp: new Date().toISOString(),
        });
      });

      set({
        receipts: [...receipts, newReceipt],
        movements: [...movements, ...newMovements],
        ingredients: updatedIngredients,
        draft: initialDraft,
      });

      return newReceipt;
    },

    getIngredientById: (id) => {
      return get().ingredients.find((ing) => ing.id === id);
    },

    getSupplierById: (id) => {
      return get().suppliers.find((sup) => sup.id === id);
    },
  })
);
