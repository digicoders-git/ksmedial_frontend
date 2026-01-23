// src/config/api.js - Centralized API Configuration

// Backend API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ksmedical-backend.onrender.com";

// API Endpoints
export const API_ENDPOINTS = {
  // KYC Endpoints
  KYC: {
    ALL: `${API_BASE_URL}/api/kyc/all`,
    SUBMIT: `${API_BASE_URL}/api/kyc/submit`,
    STATUS: (userId) => `${API_BASE_URL}/api/kyc/status/${userId}`,
    DETAILS: (id) => `${API_BASE_URL}/api/kyc/${id}`,
    APPROVE: (id) => `${API_BASE_URL}/api/kyc/approve/${id}`,
    REJECT: (id) => `${API_BASE_URL}/api/kyc/reject/${id}`,
    STATS: `${API_BASE_URL}/api/kyc/stats`,
  },

  // Withdrawal Endpoints
  WITHDRAWAL: {
    ALL: `${API_BASE_URL}/api/withdrawals/all`,
    CREATE: `${API_BASE_URL}/api/withdrawals/create`,
    USER: (userId) => `${API_BASE_URL}/api/withdrawals/user/${userId}`,
    DETAILS: (id) => `${API_BASE_URL}/api/withdrawals/${id}`,
    APPROVE: (id) => `${API_BASE_URL}/api/withdrawals/approve/${id}`,
    REJECT: (id) => `${API_BASE_URL}/api/withdrawals/reject/${id}`,
    COMPLETE: (id) => `${API_BASE_URL}/api/withdrawals/complete/${id}`,
    STATS: `${API_BASE_URL}/api/withdrawals/stats`,
  },

  // Referal Endpoints
  REFERAL: {
    DASHBOARD: (userId) => `${API_BASE_URL}/api/mlm/dashboard/${userId}`,
    REFERRALS: (userId) => `${API_BASE_URL}/api/mlm/referrals/${userId}`,
    TRANSACTIONS: (userId) => `${API_BASE_URL}/api/mlm/transactions/${userId}`,
    ADD_REFERRAL: `${API_BASE_URL}/api/mlm/add-referral`,
    VERIFY_CODE: (code) => `${API_BASE_URL}/api/mlm/verify-code/${code}`,
    STATS: `${API_BASE_URL}/api/mlm/stats`,
  },

  // Health Check
  HEALTH: `${API_BASE_URL}/health`,
};

// Helper function to build URL with query params
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Default fetch options
export const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to check if string is valid MongoDB ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  defaultFetchOptions,
  isValidObjectId,
};
