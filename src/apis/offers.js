// src/apis/offers.js
import http from "./http";

export const listOffers = async () => {
  const { data } = await http.get("admin/offers");
  return data.offers || data;
};

export const createOffer = async (offerData) => {
  const { data } = await http.post("admin/offers", offerData);
  return data;
};

export const updateOffer = async (id, offerData) => {
  const { data } = await http.put(`admin/offers/${id}`, offerData);
  return data;
};

export const deleteOffer = async (id) => {
  const { data } = await http.delete(`admin/offers/${id}`);
  return data;
};
