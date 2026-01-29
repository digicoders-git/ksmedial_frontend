import http from "./http";

export const getShops = async () => {
  const res = await http.get("/api/shops");
  return res.data;
};

export const createShop = async (data) => {
  const res = await http.post("/api/shops", data);
  return res.data;
};

export const updateShop = async (id, data) => {
  const res = await http.put(`/api/shops/${id}`, data);
  return res.data;
};

export const deleteShop = async (id) => {
  const res = await http.delete(`/api/shops/${id}`);
  return res.data;
};
