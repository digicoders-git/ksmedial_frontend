// src/apis/products.js
import http from "./http";

export const listProducts = async (params = {}) => {
  const { data } = await http.get("admin/products", { params });
  return data.products || data;
};

export const getProductDetails = async (idOrSlug) => {
  const { data } = await http.get(`admin/products/${idOrSlug}`);
  return data;
};

export const createProduct = async (formData) => {
  const { data } = await http.post("admin/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async (idOrSlug, formData) => {
  const { data } = await http.put(`admin/products/${idOrSlug}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (idOrSlug) => {
  const { data } = await http.delete(`admin/products/${idOrSlug}`);
  return data;
};

export const bulkUploadProduct = async (formData) => {
  const { data } = await http.post("admin/products/bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
