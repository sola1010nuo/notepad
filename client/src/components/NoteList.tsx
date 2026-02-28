import React from 'react';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectNote: (note: Note) => void;
  deleteNote: (id: string) => Promise<void>;
}

const NoteList: React.FC<NoteListProps> = ({ notes, selectNote, deleteNote }) => {
  return (
    <div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <span onClick={() => selectNote(note)}>{note.title}</span>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;