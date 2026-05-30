export type UserRole = "manager" | "accountant" | "staff" | "customer";

export type UserAccount = {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
};

export type AuthSession = {
  accountId: string;
  fullName: string;
  username: string;
  role: UserRole;
  loginAt: string;
};
