// src/apis/dashboard.js
import http from "./http";

export const getDashboardOverview = async () => {
  try {
    const { data } = await http.get("/admin/stats");
    return data;
  } catch (error) {
    console.error("Dashboard overview /admin/stats failed:", error);
    // try /admin/dashboard-stats
    try {
      const { data } = await http.get("/admin/dashboard-stats");
      return data;
    } catch {
      // try /admin/dashboard
      try {
        const { data } = await http.get("/admin/dashboard");
        return data;
      } catch {
        // try /dashboard/stats (maybe accessible by admin too)
        try {
          const { data } = await http.get("/dashboard/stats");
          return data;
        } catch {
          throw error;
        }
      }
    }
  }
};
