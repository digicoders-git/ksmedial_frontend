// src/apis/admin.js
import http from "./http";

export const changePassword = async (payload) => {
  const { data } = await http.post("admin/change-password", payload);
  return data;
};
