import { apiClient } from "./http";

// MLM Dashboard APIs
export const getMLMDashboard = async () => {
  try {
    const response = await apiClient.get("/mlm/dashboard");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Referral APIs
export const getReferrals = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/referrals", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReferralDetails = async (referralId) => {
  try {
    const response = await apiClient.get(`/mlm/referrals/${referralId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateReferralCode = async () => {
  try {
    const response = await apiClient.post("/mlm/referrals/generate-code");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Task APIs
export const getTasks = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/tasks", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const startTask = async (taskId) => {
  try {
    const response = await apiClient.post(`/mlm/tasks/${taskId}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const completeTask = async (taskId, data = {}) => {
  try {
    const response = await apiClient.post(`/mlm/tasks/${taskId}/complete`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTaskDetails = async (taskId) => {
  try {
    const response = await apiClient.get(`/mlm/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Earnings APIs
export const getEarnings = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/earnings", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/transactions", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const exportTransactions = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/transactions/export", { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Withdrawal APIs
export const getWithdrawalMethods = async () => {
  try {
    const response = await apiClient.get("/mlm/withdrawal/methods");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addWithdrawalMethod = async (methodData) => {
  try {
    const response = await apiClient.post("/mlm/withdrawal/methods", methodData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateWithdrawalMethod = async (methodId, methodData) => {
  try {
    const response = await apiClient.put(`/mlm/withdrawal/methods/${methodId}`, methodData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteWithdrawalMethod = async (methodId) => {
  try {
    const response = await apiClient.delete(`/mlm/withdrawal/methods/${methodId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const requestWithdrawal = async (withdrawalData) => {
  try {
    const response = await apiClient.post("/mlm/withdrawal/request", withdrawalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWithdrawalHistory = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/withdrawal/history", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const cancelWithdrawal = async (withdrawalId) => {
  try {
    const response = await apiClient.post(`/mlm/withdrawal/${withdrawalId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// MLM Statistics APIs
export const getMLMStats = async (period = "month") => {
  try {
    const response = await apiClient.get(`/mlm/stats?period=${period}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReferralTree = async (userId = null) => {
  try {
    const response = await apiClient.get(`/mlm/referral-tree${userId ? `?userId=${userId}` : ""}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Commission APIs
export const getCommissionRates = async () => {
  try {
    const response = await apiClient.get("/mlm/commission/rates");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCommissionHistory = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/commission/history", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Bonus APIs
export const getBonuses = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/bonuses", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const claimBonus = async (bonusId) => {
  try {
    const response = await apiClient.post(`/mlm/bonuses/${bonusId}/claim`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Rank/Level APIs
export const getUserRank = async () => {
  try {
    const response = await apiClient.get("/mlm/rank");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRankRequirements = async () => {
  try {
    const response = await apiClient.get("/mlm/rank/requirements");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Notification APIs
export const getMLMNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get("/mlm/notifications", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/mlm/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};