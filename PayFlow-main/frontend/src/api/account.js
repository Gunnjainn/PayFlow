import apiClient from './client';

export const getBalance = () => apiClient.get('/account/balance');
export const transfer = (data) => apiClient.post('/account/transfer', data);
export const getTransactions = (limit = 50, skip = 0) => 
    apiClient.get(`/account/transactions?limit=${limit}&skip=${skip}`);



