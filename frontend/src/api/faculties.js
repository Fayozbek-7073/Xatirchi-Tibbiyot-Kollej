import api from './axios'

export const getFaculties = () => api.get('/faculties')
export const createFaculty = (data) => api.post('/faculties', data)
export const updateFaculty = (id, data) => api.put(`/faculties/${id}`, data)
export const deleteFaculty = (id) => api.delete(`/faculties/${id}`)
