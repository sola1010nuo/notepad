export {};

declare global {
  interface Window {
    electronAPI?: {
      updateReminders: (payload: {
        notes: Array<{
          id: string;
          title: string;
          content: string;
          startAt?: string | null;
          endAt?: string | null;
        }>;
        remindAdvanceMinutes: number;
      }) => Promise<{ ok: boolean }>;
      resetReminder: (noteId: string) => Promise<{ ok: boolean }>;
      removeReminder: (noteId: string) => Promise<{ ok: boolean }>;
    };
  }
}