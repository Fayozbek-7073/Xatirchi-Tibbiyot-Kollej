import api from './axios'

export const getPayments = (params) => api.get('/payments', { params })
export const createPayment = (data) => api.post(`/students/${data.student_id}/payment`, data)
