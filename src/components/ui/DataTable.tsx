import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyText = "Không có dữ liệu"
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
