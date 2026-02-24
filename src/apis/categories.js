// src/apis/categories.js
import http from "./http";

export const getCategories = async () => {
  const { data } = await http.get("admin/categories");
  return data.categories || data;
};

export const createCategory = async (catData) => {
  const { data } = await http.post("admin/categories", catData);
  return data;
};

export const updateCategory = async (id, catData) => {
  const { data } = await http.put(`admin/categories/${id}`, catData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await http.delete(`admin/categories/${id}`);
  return data;
};
