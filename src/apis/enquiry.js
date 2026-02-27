// src/apis/enquiry.js
import http from "./http";

export const listEnquiries = async () => {
  const { data } = await http.get("admin/enquiries");
  return data.enquiries || data;
};

export const updateEnquiry = async (id, payload) => {
  const { data } = await http.put(`admin/enquiries/${id}`, payload);
  return data;
};

export const deleteEnquiry = async (id) => {
  const { data } = await http.delete(`admin/enquiries/${id}`);
  return data;
};
