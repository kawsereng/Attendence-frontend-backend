import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" }
});

export const studentApi = {
  all: () => api.get("/student/all"),
  one: (id) => api.get(`/student/${id}`),
  add: (payload) => api.post("/student/add", payload),
  updateAttendance: (id, payload) => api.post(`/student/update/${id}`, payload),
  remove: (id) => api.delete(`/student/${id}`)
};

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong";
}

export function unwrapStudents(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

export function unwrapStudent(data) {
  return data?.data?.student || data?.data || data?.student || data;
}