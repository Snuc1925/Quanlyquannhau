import { Select } from "@/components/ui";
import type { Supplier } from "../types";

type SupplierSelectorProps = {
  suppliers: Supplier[];
  value: string | null;
  onChange: (supplierId: string) => void;
};

export function SupplierSelector({
  suppliers,
  value,
  onChange,
}: SupplierSelectorProps) {
  return (
    <Select
      id="supplier"
      label="Nhà cung cấp"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="" disabled>
        -- Chọn nhà cung cấp --
      </option>
      {suppliers.map((sup) => (
        <option key={sup.id} value={sup.id}>
          {sup.name}
        </option>
      ))}
    </Select>
  );
}
