import apiClient from './client';

export const signup = (data) => apiClient.post('/user/signup', data);
export const signin = (data) => apiClient.post('/user/signin', data);
export const getAuth = () => apiClient.get('/user/auth');
export const searchUsers = (filter) => apiClient.get(`/user/bulk?filter=${filter || ''}`);



