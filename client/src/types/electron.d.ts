export {};

declare global {
  interface Window {
    electronAPI?: {
      updateReminders: (payload: {
        notes: {
          id: string;
          title: string;
          content: string;
          startAt?: string | null;
          endAt?: string | null;
        }[];
        remindAdvanceMinutes: number;
      }) => Promise<any>;

      resetReminder: (noteId: string) => Promise<any>;
      removeReminder: (noteId: string) => Promise<any>;

      saveBackupFile: (
        content: string,
        defaultFileName: string
      ) => Promise<{
        ok: boolean;
        canceled?: boolean;
        filePath?: string;
        error?: string;
      }>;

      openBackupFile: () => Promise<{
        ok: boolean;
        canceled?: boolean;
        filePath?: string;
        content?: string;
        error?: string;
      }>;
    };
  }
}