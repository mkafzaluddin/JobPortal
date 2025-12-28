import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api", 
  // baseURL: "/api"
  baseURL: "http://57.152.33.193:5000/api"
});

// Automatically add JWT token if stored
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
