// src/apis/enquiry.js
import http from "./http";

export const getEnquiries = async () => {
  const { data } = await http.get("/admin/enquiries");
  return data.enquiries || data;
};

export const deleteEnquiry = async (id) => {
  const { data } = await http.delete(`/admin/enquiries/${id}`);
  return data;
};
