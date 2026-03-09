// api.ts - 封裝所有與後端 API 互動的函式，統一處理錯誤
import axios from "axios";
import { CreateNoteInput, UpdateNoteInput } from "../types";

// Electron build 時是 file://，沒有 CRA proxy，所以要改成打 localhost:5000
function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.location.protocol === "file:") {
    return "http://localhost:5000/api"; // ← 你的 Express PORT（預設 5000）
  }
  return "/api"; // ← dev 模式走 CRA proxy
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // ✅ 避免卡 30 秒以上
});

export const fetchNotes = async () => {
  try {
    const response = await api.get(`/notes`);
    return response.data;
  } catch (error: any) {
    throw new Error("Error fetching notes: " + (error?.message ?? "unknown"));
  }
};

export const createNote = async (note: CreateNoteInput) => {
  try {
    const response = await api.post(`/notes`, note);
    return response.data;
  } catch (error: any) {
    throw new Error("Error creating note: " + (error?.message ?? "unknown"));
  }
};

export const updateNote = async (id: string, note: UpdateNoteInput) => {
  try {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  } catch (error: any) {
    throw new Error("Error updating note: " + (error?.message ?? "unknown"));
  }
};

export const deleteNote = async (id: string) => {
  try {
    await api.delete(`/notes/${id}`);
  } catch (error: any) {
    throw new Error("Error deleting note: " + (error?.message ?? "unknown"));
  }
};