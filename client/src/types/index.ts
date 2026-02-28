export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type NoteList = Note[];

export interface CreateNoteInput {
    title: string;
    content: string;
}

export interface UpdateNoteInput {
    id: string;
    title?: string;
    content?: string;
}