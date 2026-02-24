// src/services/api.js
import http from "../apis/http";

// KYC APIs
export const kycAPI = {
  submitKYC: async (kycData) => {
    const { data } = await http.post("kyc/submit", kycData);
    return data;
  },
  getKYCStatus: async (userId) => {
    const { data } = await http.get(`kyc/status/${userId}`);
    return data;
  },
  getAllKYC: async (status = "all") => {
    const { data } = await http.get(`kyc/all?status=${status}`);
    return data;
  },
  getKYCById: async (id) => {
    const { data } = await http.get(`kyc/${id}`);
    return data;
  },
  approveKYC: async (id) => {
    const { data } = await http.post(`kyc/approve/${id}`);
    return data;
  },
  rejectKYC: async (id, reason) => {
    const { data } = await http.post(`kyc/reject/${id}`, { reason });
    return data;
  },
  getKYCStats: async () => {
    const { data } = await http.get("kyc/stats");
    return data;
  },
};

// Withdrawal APIs
export const withdrawalAPI = {
  createWithdrawal: async (withdrawalData) => {
    const { data } = await http.post("withdrawals/create", withdrawalData);
    return data;
  },
  getUserWithdrawals: async (userId) => {
    const { data } = await http.get(`withdrawals/user/${userId}`);
    return data;
  },
  getAllWithdrawals: async (status = "all") => {
    const { data } = await http.get(`withdrawals/all?status=${status}`);
    return data;
  },
  getWithdrawalById: async (id) => {
    const { data } = await http.get(`withdrawals/${id}`);
    return data;
  },
  approveWithdrawal: async (id) => {
    const { data } = await http.post(`withdrawals/approve/${id}`);
    return data;
  },
  rejectWithdrawal: async (id, reason) => {
    const { data } = await http.post(`withdrawals/reject/${id}`, { reason });
    return data;
  },
  completeWithdrawal: async (id, payload) => {
    const { data } = await http.post(`withdrawals/complete/${id}`, payload);
    return data;
  },
  getWithdrawalStats: async () => {
    const { data } = await http.get("withdrawals/stats");
    return data;
  },
};
