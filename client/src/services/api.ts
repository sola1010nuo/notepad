import axios from 'axios';
import { CreateNoteInput, UpdateNoteInput } from '../types';

const API_BASE_URL = "/api";

export const fetchNotes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/notes`);
        return response.data;
    } catch (error: any) {
        throw new Error('Error fetching notes: ' + error.message);
    }
};

export const createNote = async (note: CreateNoteInput) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/notes`, note);
        return response.data;
    } catch (error: any) {
        throw new Error('Error creating note: ' + error.message);
    }
};

export const updateNote = async (id: string, note: UpdateNoteInput) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/notes/${id}`, note);
        return response.data;
    } catch (error: any) {
        throw new Error('Error updating note: ' + error.message);
    }
};

export const deleteNote = async (id: string) => {
    try {
        await axios.delete(`${API_BASE_URL}/notes/${id}`);
    } catch (error: any) {
        throw new Error('Error deleting note: ' + error.message);
    }
};