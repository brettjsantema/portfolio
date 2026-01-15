// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  resume: `${API_URL}/api/resume`,
  leaderboard: `${API_URL}/api/leaderboard`,
  health: `${API_URL}/api/health`,
};
