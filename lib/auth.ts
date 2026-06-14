export const USERS = ["harigovind", "rahul", "shilna"] as const;

export type UserName = (typeof USERS)[number];

export const AUTH_KEY = "bom_auth";
export const USER_KEY = "bom_user";

export function validateLogin(password: string): UserName | null {
  const normalized = password.trim().toLowerCase();
  return USERS.includes(normalized as UserName) ? (normalized as UserName) : null;
}

export function getLoggedInUser(): UserName | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  return user && USERS.includes(user as UserName) ? (user as UserName) : null;
}

export function formatUserName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
