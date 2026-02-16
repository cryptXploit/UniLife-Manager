import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Groups API calls
export const groupsAPI = {
  createGroup: (groupData) => api.post('/groups/create', groupData),
  joinRequest: (requestData) => api.post('/groups/join-request', requestData),
  getMyGroups: () => api.get('/groups/my-groups'),
  getGroupRequests: (groupId) => api.get(`/groups/${groupId}/requests`),
  reviewRequest: (requestId, action, notes) => 
    api.post(`/groups/requests/${requestId}/review`, { action, reviewNotes: notes }),
};

// Courses API
export const coursesAPI = {
  getCourses: () => api.get('/courses'),
  getTodayCourses: () => api.get('/courses/today'),
  addCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};

// Routine/Habit API
export const routineAPI = {
  getHabits: () => api.get('/routine'),
  getTodayHabits: () => api.get('/routine/today'),
  addHabit: (habitData) => api.post('/routine', habitData),
  updateHabit: (id, habitData) => api.put(`/routine/${id}`, habitData),
  completeHabit: (id) => api.post(`/routine/${id}/complete`),
  deleteHabit: (id) => api.delete(`/routine/${id}`),
};

// Expense API
export const expenseAPI = {
  getExpenses: () => api.get('/expenses/current-month'),
  addExpense: (expenseData) => api.post('/expenses', expenseData),
  setBudget: (budgetData) => api.post('/expenses/budget', budgetData),
  getCurrentBudget: () => api.get('/expenses/budget/current'),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

// Notes API
export const notesAPI = {
  getNotes: () => api.get('/notes'),
  getCourseNotes: (courseId) => api.get(`/notes/course/${courseId}`),
  addNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  shareNote: (id, shareData) => api.post(`/notes/${id}/share`, shareData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
  markAttendance: (attendanceData) => api.post('/dashboard/attendance', attendanceData),
  getStatistics: () => api.get('/dashboard/statistics'),
};

export default api;