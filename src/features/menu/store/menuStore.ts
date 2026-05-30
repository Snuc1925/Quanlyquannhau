import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, MenuFormData } from "../types";
import { mockMenuItems } from "../data/mockMenu";

let _nextId = mockMenuItems.length + 1;
const genId = () => `m-${String(++_nextId).padStart(2, "0")}`;

type MenuStore = {
  items: MenuItem[];
  addItem: (data: MenuFormData) => void;
  updateItem: (id: string, data: MenuFormData) => void;
  deleteItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
};

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      items: mockMenuItems,

      addItem: (data) =>
        set((s) => ({
          items: [
            ...s.items,
            {
              ...data,
              id: genId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateItem: (id, data) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      deleteItem: (id) =>
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        })),

      toggleAvailability: (id) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  available: !item.available,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        })),
    }),
    { name: "menu-store" }
  )
);
