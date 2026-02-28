import { useState, useEffect } from 'react';
import { Note, CreateNoteInput, UpdateNoteInput } from '../types';

export const useNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('/api/notes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setNotes(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const addNote = async (newNote: CreateNoteInput) => {
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote),
            });
            if (!response.ok) {
                throw new Error('Failed to add note');
            }
            const addedNote = await response.json();
            setNotes((prevNotes) => [...prevNotes, addedNote]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateNote = async (id: string, updated: UpdateNoteInput) => {
        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            if (!response.ok) {
                throw new Error('Failed to update note');
            }
            const note = await response.json();
            setNotes((prev) => prev.map(n => n.id === id ? note : n));
            if (selectedNote && selectedNote.id === id) {
                setSelectedNote(note);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            setNotes((prevNotes) => prevNotes.filter(note => note.id !== noteId));
            if (selectedNote && selectedNote.id === noteId) {
                setSelectedNote(null);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const selectNote = (note: Note) => {
        setSelectedNote(note);
    };


    return { notes, selectedNote, loading, error, addNote, updateNote, deleteNote, selectNote };
};

// keep default for backwards compatibility
export default useNotes;