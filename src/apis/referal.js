// src/apis/referal.js
import http from "./http";

export const getReferalDashboard = async (userId) => {
  const { data } = await http.get(`/mlm/dashboard/${userId}`);
  return data;
};

export const getReferrals = async (userId, params = {}) => {
  const { data } = await http.get(`/mlm/referrals/${userId}`, { params });
  return data;
};

export const getReferralDetails = async (id) => {
  const { data } = await http.get(`/mlm/referral/${id}`);
  return data;
};

export const getEarnings = async (userId) => {
  const { data } = await http.get(`/mlm/earnings/${userId}`);
  return data;
};

export const getWithdrawals = async (userId) => {
  const { data } = await http.get(`/mlm/withdrawals/${userId}`);
  return data;
};

export const getTasks = async () => {
  const { data } = await http.get("/mlm/tasks");
  return data.tasks || data;
};

export const startTask = async (taskId) => {
  const { data } = await http.post(`/mlm/tasks/start/${taskId}`);
  return data;
};

export const completeTask = async (taskId, payload) => {
  const { data } = await http.post(`/mlm/tasks/complete/${taskId}`, payload);
  return data;
};

export const getReferalStats = async () => {
  const { data } = await http.get("/mlm/stats");
  return data;
};