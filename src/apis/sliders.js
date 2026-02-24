// src/apis/sliders.js
import http from "./http";

export const getSliders = async () => {
  const { data } = await http.get("/admin/sliders");
  return data.sliders || data;
};

export const createSlider = async (formData) => {
  const { data } = await http.post("/admin/sliders", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteSlider = async (id) => {
  const { data } = await http.delete(`/admin/sliders/${id}`);
  return data;
};
