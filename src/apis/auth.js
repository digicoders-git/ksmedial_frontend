// src/apis/auth.js
import http from "./http";

export const adminLogin = async ({ adminId, password }) => {
  const { data } = await http.post("admin/login", { adminId, password });
  return data;
};
