import React, { useState, useEffect } from 'react';

import { CreateNoteInput, UpdateNoteInput } from '../types';

interface NoteEditorProps {
  addNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (id: string, note: UpdateNoteInput) => Promise<void>;
  selectedNote: { id: string; title: string; content: string } | null;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ addNote, updateNote, selectedNote }) => {
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [content, setContent] = useState(selectedNote?.content || '');

  useEffect(() => {
    setTitle(selectedNote?.title || '');
    setContent(selectedNote?.content || '');
  }, [selectedNote]);

  const handleSave = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { id: selectedNote.id, title, content });
    } else {
      addNote({ title, content });
    }
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSave}>Save Note</button>
    </div>
  );
};

export default NoteEditor;