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

export const STUDENT_STORAGE_KEYS = [
  "sunshine_student",
  "sunshine_student_user",
  "sunshine_student_logged_in",
  "student_id",
  "student_username",
  "student_role",
  "student_status",
];

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function clearStudentAuthStorage() {
  STUDENT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
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

export function readStudentSession() {
  const storageKeys = ["sunshine_student", "sunshine_student_user"];

  for (const key of storageKeys) {
    const rawSession = localStorage.getItem(key);

    if (!rawSession) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawSession);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (error) {
      console.error("Student session parse error:", error);
      localStorage.removeItem(key);
    }
  }

  const fallbackId = localStorage.getItem("student_id");

  if (!fallbackId) {
    return null;
  }

  return {
    id: fallbackId,
    student_id: fallbackId,
    username: localStorage.getItem("student_username") || fallbackId,
    role: localStorage.getItem("student_role") || "student",
    status: localStorage.getItem("student_status") || "active",
  };
}
