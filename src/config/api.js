const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost/sunshine-api/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export default API_BASE_URL;
