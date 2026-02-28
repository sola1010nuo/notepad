import React from 'react';

interface NoteViewerProps {
    title: string;
    content: string;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ title, content }) => {
    return (
        <div className="note-viewer">
            <h2>{title}</h2>
            <p>{content}</p>
        </div>
    );
};

export default NoteViewer;