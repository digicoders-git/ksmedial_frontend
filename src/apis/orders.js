// src/apis/orders.js
import http from "./http";

export const listOrders = async (params = {}) => {
  const { data } = await http.get("admin/orders", { params });
  return data.orders || data;
};

export const getOrderDetails = async (id) => {
  const { data } = await http.get(`admin/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (id, updateData) => {
  const { data } = await http.put(`admin/orders/${id}/status`, updateData);
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await http.delete(`admin/orders/${id}`);
  return data;
};
