// src/apis/shops.js
import http from "./http";

export const getShops = async () => {
  const { data } = await http.get("admin/shops");
  return data.shops || data;
};

export const createShop = async (shopData) => {
  const { data } = await http.post("admin/shops", shopData);
  return data;
};

export const updateShop = async (id, shopData) => {
  const { data } = await http.put(`admin/shops/${id}`, shopData);
  return data;
};

export const deleteShop = async (id) => {
  const { data } = await http.delete(`admin/shops/${id}`);
  return data;
};
