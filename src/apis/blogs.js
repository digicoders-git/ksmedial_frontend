// src/apis/blogs.js
import http from "./http";

export const getBlogs = async () => {
  const { data } = await http.get("/admin/blogs");
  return data.blogs || data;
};

export const createBlog = async (formData) => {
  const { data } = await http.post("/admin/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBlog = async (id, formData) => {
  const { data } = await http.put(`/admin/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBlog = async (id) => {
  const { data } = await http.delete(`/admin/blogs/${id}`);
  return data;
};