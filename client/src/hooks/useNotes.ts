//業務流程/狀態管理層 (state + business logic layer)。

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotes as apiFetchNotes,
  createNote as apiCreateNote,
  deleteNote as apiDeleteNote,
  updateNote as apiUpdateNote,
} from "../services/api";

export type Note = {
  id: string;
  title: string;
  content: string;
  startAt?: string | null;
  endAt?: string | null;
  tag?: string | null;
  remind?: number; // 0 或 1
  createdAt: string;
  updatedAt: string;
};

type CreateNotePayload = {
  title: string;
  content: string;
  startAt?: string | null;
  endAt?: string | null;
  tag?: string | null;
  remind?: number; // 0 或 1
};

type UpdateNotePayload = {
  title?: string;
  content?: string;
  startAt?: string | null;
  endAt?: string | null;
  tag?: string | null;
  remind?: number; // 0 或 1
};

function isExpiredReminder(note: Note) {
  if (note.remind !== 1) return false;
  if (!note.endAt) return false;

  const end = new Date(note.endAt).getTime();
  if (Number.isNaN(end)) return false;

  return end <= Date.now();
}

export function useNotes(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 自動關閉已過期提醒（不打開 loading，避免 UI 一直閃）
  const autoDisableExpiredReminders = useCallback(async (list: Note[]) => {
    const expiredNotes = list.filter(isExpiredReminder);

    if (expiredNotes.length === 0) return list;

    // 先把前端畫面直接改掉，讓 UI 立刻正確
    const cleanedList = list.map((note) =>
      isExpiredReminder(note) ? { ...note, remind: 0 } : note
    );

    setNotes(cleanedList);

    // 再同步寫回後端
    await Promise.allSettled(
      expiredNotes.map((note) =>
        apiUpdateNote(note.id, {
          title: note.title,
          content: note.content,
          startAt: note.startAt ?? null,
          endAt: note.endAt ?? null,
          tag: note.tag ?? null,
          remind: 0,
        } as any)
      )
    );

    return cleanedList;
  }, []);

  const refresh = useCallback(async () => {
    setErrMsg(null);
    setLoading(true);
    try {
      const data = await apiFetchNotes();
      const list = Array.isArray(data) ? data : data?.notes ?? [];

      setNotes(list);

      // 載入後順手清掉已過期提醒
      await autoDisableExpiredReminders(list);
    } catch (e: any) {
      setErrMsg(e?.message ?? "讀取失敗");
    } finally {
      setLoading(false);
    }
  }, [autoDisableExpiredReminders]);

  const create = useCallback(
    async (payload: CreateNotePayload) => {
      setErrMsg(null);
      setLoading(true);
      try {
        await apiCreateNote(payload as any);
        await refresh();
        return true;
      } catch (e: any) {
        setErrMsg(e?.message ?? "新增失敗");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: UpdateNotePayload) => {
      setErrMsg(null);
      setLoading(true);
      try {
        const updated = await apiUpdateNote(id, payload as any);

        // 如果更新後的資料已經過期，就直接把提醒關掉
        const normalized = isExpiredReminder(updated)
          ? { ...updated, remind: 0 }
          : updated;

        setNotes((prev) => prev.map((n) => (n.id === id ? normalized : n)));

        // 如果剛好更新完就已過期，順便再寫回一次提醒關閉
        if (isExpiredReminder(updated)) {
          await apiUpdateNote(id, {
            title: updated.title,
            content: updated.content,
            startAt: updated.startAt ?? null,
            endAt: updated.endAt ?? null,
            tag: updated.tag ?? null,
            remind: 0,
          } as any);
        }

        return true;
      } catch (e: any) {
        setErrMsg(e?.message ?? "更新失敗");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      await apiDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return true;
    } catch (e: any) {
      setErrMsg(e?.message ?? "刪除失敗");
      return false;
    }
  }, []);

  // 批量刪除 - 不設置 loading，避免 Modal 被鎖定
  const batchRemove = useCallback(async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => apiDeleteNote(id)));
      setNotes((prev) => prev.filter((n) => !ids.includes(n.id)));
      return true;
    } catch (e: any) {
      setErrMsg(e?.message ?? "批量刪除失敗");
      return false;
    }
  }, []);

  // 自動載入
  useEffect(() => {
    if (autoFetch) refresh();
  }, [autoFetch, refresh]);

  // App 開著時，每分鐘檢查一次是否有提醒過期
  useEffect(() => {
    const timer = setInterval(() => {
      setNotes((prev) => {
        const hasExpired = prev.some(isExpiredReminder);
        if (!hasExpired) return prev;

        const cleaned = prev.map((note) =>
          isExpiredReminder(note) ? { ...note, remind: 0 } : note
        );

        // 非同步寫回後端
        const expiredNotes = prev.filter(isExpiredReminder);
        Promise.allSettled(
          expiredNotes.map((note) =>
            apiUpdateNote(note.id, {
              title: note.title,
              content: note.content,
              startAt: note.startAt ?? null,
              endAt: note.endAt ?? null,
              tag: note.tag ?? null,
              remind: 0,
            } as any)
          )
        );

        return cleaned;
      });
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    notes,
    loading,
    errMsg,
    setErrMsg, // 讓 UI 需要時可清錯誤
    refresh,
    update,
    create,
    remove,
    batchRemove,
  };
}