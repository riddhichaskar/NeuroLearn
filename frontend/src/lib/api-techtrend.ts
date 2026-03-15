import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_TECHTREND || 'http://localhost:8002/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const techTrendApi = {
  // Get main dashboard data
  getDashboard: async () => {
    const { data } = await apiClient.get('/dashboard');
    return data;
  },

  // Get stacks with optional filtering
  getStacks: async () => {
    const { data } = await apiClient.get('/stacks');
    return data;
  },

  // Get forecast for a specific technology
  getForecast: async (stackName: string, days: number = 30) => {
    const { data } = await apiClient.get(`/forecast/${stackName}`, {
      params: { days },
    });
    return data;
  },

  // Compare multiple technologies
  compareStacks: async (stacks: string[]) => {
    const { data } = await apiClient.get('/compare', {
      params: { stacks: stacks.join(',') },
    });
    return data;
  },

  // Get deep dive into a category
  getCategoryTrends: async (category: string) => {
    const { data } = await apiClient.get(`/trends/${category}`);
    return data;
  }
};