const PROTECTED_ADMIN_NAMES = new Set([
  //"firozmahmud",
  "abdulmuhaimine",
]);

const normalizeName = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z]/g, "");

export const isProtectedAdministrator = (user) => [
  user?.full_name,
  user?.name_en,
  user?.name_bn,
].some((name) => PROTECTED_ADMIN_NAMES.has(normalizeName(name)));

