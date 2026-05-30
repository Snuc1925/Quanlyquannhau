import type { UserAccount } from "@/types/auth";

export const demoAccounts: UserAccount[] = [
  {
    id: "acc-manager-01",
    username: "manager",
    password: "manager123",
    fullName: "Quản lý cửa hàng",
    role: "manager"
  },
  {
    id: "acc-accountant-01",
    username: "accountant",
    password: "accountant123",
    fullName: "Kế toán",
    role: "accountant"
  },
  {
    id: "acc-staff-01",
    username: "staff",
    password: "staff123",
    fullName: "Nhân viên phục vụ",
    role: "staff"
  },
  {
    id: "acc-customer-01",
    username: "customer",
    password: "customer123",
    fullName: "Khách hàng",
    role: "customer"
  }
];
