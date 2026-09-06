import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const priceForecastAPI = (data) =>
  api.post('/api/price-forecast', data);

export const buyerMatchAPI = (data) =>
  api.post('/api/buyer-matching', data);

export const storageAdvisorAPI = (data) =>
  api.post('/api/storage-advisor', data);

export const qualityGradingAPI = (data) =>
  api.post('/api/quality-grading', data);

export const incomeDashboardAPI = (farmerId) =>
  api.get(`/api/income-dashboard/${farmerId}`);

export const orchestratorAPI = (data) =>
  api.post('/api/orchestrator', data);

export const getMandisAPI = () =>
  api.get('/api/mandis');

export const getFarmersAPI = () =>
  api.get('/api/farmers');

export const getBuyersAPI = () =>
  api.get('/api/buyers');

export default api;
