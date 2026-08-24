export const AUTH_STORAGE_KEYS = [
  "sunshine_user",
  "sunshine_logged_in",
  "teacher_branch",
  "is_admin",
  "admin",
  "user",
  "loggedInUser",
  "admin_id",
  "user_id",
];

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function readStoredUser() {
  const rawUser = localStorage.getItem("sunshine_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("User parse error:", error);
    clearAuthStorage();
    return null;
  }
}
