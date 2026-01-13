// services/api.js
const API_BASE_URL = "http://localhost:5000/api";

// KYC APIs
export const kycAPI = {
  // Submit KYC
  submitKYC: async (kycData) => {
    const response = await fetch(`${API_BASE_URL}/kyc/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kycData),
    });
    return response.json();
  },

  // Get KYC status for a user
  getKYCStatus: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/kyc/status/${userId}`);
    return response.json();
  },

  // Get all KYC requests (Admin)
  getAllKYC: async (status = "all") => {
    const response = await fetch(`${API_BASE_URL}/kyc/all?status=${status}`);
    return response.json();
  },

  // Get KYC by ID
  getKYCById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/kyc/${id}`);
    return response.json();
  },

  // Approve KYC (Admin)
  approveKYC: async (id, adminId) => {
    const response = await fetch(`${API_BASE_URL}/kyc/approve/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId }),
    });
    return response.json();
  },

  // Reject KYC (Admin)
  rejectKYC: async (id, adminId, reason) => {
    const response = await fetch(`${API_BASE_URL}/kyc/reject/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, reason }),
    });
    return response.json();
  },

  // Get KYC statistics
  getKYCStats: async () => {
    const response = await fetch(`${API_BASE_URL}/kyc/stats`);
    return response.json();
  },
};

// Withdrawal APIs
export const withdrawalAPI = {
  // Create withdrawal request
  createWithdrawal: async (withdrawalData) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withdrawalData),
    });
    return response.json();
  },

  // Get user's withdrawals
  getUserWithdrawals: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/user/${userId}`);
    return response.json();
  },

  // Get all withdrawals (Admin) - Only KYC verified users
  getAllWithdrawals: async (status = "all") => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/all?status=${status}`);
    return response.json();
  },

  // Get withdrawal by ID
  getWithdrawalById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/${id}`);
    return response.json();
  },

  // Approve withdrawal (Admin)
  approveWithdrawal: async (id, adminId) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/approve/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId }),
    });
    return response.json();
  },

  // Reject withdrawal (Admin)
  rejectWithdrawal: async (id, adminId, reason) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/reject/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, reason }),
    });
    return response.json();
  },

  // Complete withdrawal (Admin)
  completeWithdrawal: async (id, transactionId, transactionProof) => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/complete/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, transactionProof }),
    });
    return response.json();
  },

  // Get withdrawal statistics
  getWithdrawalStats: async () => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/stats`);
    return response.json();
  },
};
