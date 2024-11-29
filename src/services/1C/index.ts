import axios from "axios";

if (!process.env.ONEC_API_URL) {
  throw new Error("ONEC_API_URL is not set");
}

const api = axios.create({
  baseURL: process.env.ONEC_API_URL,
});

api.defaults.headers.common["Authorization"] = process.env.ONEC_API_AUTH_HEADER;

export default api;
