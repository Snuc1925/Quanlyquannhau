export type MenuCategory = "bia" | "do-nham" | "hai-san" | "do-nong" | "nuoc-ngot";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  emoji: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuFormData = Omit<MenuItem, "id" | "createdAt" | "updatedAt">;

export const CATEGORY_META: Record<
  MenuCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  "bia":       { label: "Bia",         icon: "🍺", color: "#92400e", bg: "#fef3c7" },
  "do-nham":   { label: "Đồ nhắm",    icon: "🥜", color: "#065f46", bg: "#d1fae5" },
  "hai-san":   { label: "Hải sản",     icon: "🦐", color: "#1e40af", bg: "#dbeafe" },
  "do-nong":   { label: "Đồ nóng",    icon: "🍲", color: "#9f1239", bg: "#ffe4e6" },
  "nuoc-ngot": { label: "Nước & ngọt", icon: "🥤", color: "#5b21b6", bg: "#ede9fe" },
};
