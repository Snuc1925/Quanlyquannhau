import { useState, useMemo } from "react";
import { Input, Button } from "@/components/ui";
import type { Ingredient } from "../types";

type IngredientSearchProps = {
  ingredients: Ingredient[];
  onAdd: (ingredientId: string) => void;
  disabledIds: string[];
};

export function IngredientSearch({
  ingredients,
  onAdd,
  disabledIds,
}: IngredientSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ingredients.filter((ing) =>
      ing.name.toLowerCase().includes(q)
    );
  }, [query, ingredients]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
      <Input
        id="ingredientSearch"
        label="Tìm kiếm nguyên liệu"
        placeholder="Gõ tên nguyên liệu..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length > 0 ? (
        <div
          style={{
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid var(--c-gray-200)",
            borderRadius: "var(--r-sm)",
          }}
        >
          {filtered.map((ing) => {
            const disabled = disabledIds.includes(ing.id);
            return (
              <div
                key={ing.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--sp-3)",
                  borderBottom: "1px solid var(--c-gray-100)",
                  background: disabled ? "var(--c-gray-50)" : "transparent",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "var(--fw-medium)",
                      color: disabled ? "var(--c-gray-400)" : "var(--c-gray-900)",
                    }}
                  >
                    {ing.name}
                  </div>
                  <div className="text-muted">
                    Tồn kho: {ing.currentStock} {ing.unit} {ing.hasExpiry ? "⏰" : ""}
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={disabled}
                  onClick={() => onAdd(ing.id)}
                >
                  {disabled ? "✓ Đã thêm" : "+ Thêm"}
                </Button>
              </div>
            );
          })}
        </div>
      ) : query.trim() ? (
        <p className="text-muted" style={{ textAlign: "center", padding: "var(--sp-4)" }}>
          Không tìm thấy nguyên liệu "{query}"
        </p>
      ) : null}
    </div>
  );
}
