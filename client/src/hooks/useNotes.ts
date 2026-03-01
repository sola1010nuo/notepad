//業務流程/狀態管理層 (state + business logic layer)。

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotes as apiFetchNotes,
  createNote as apiCreateNote,
  deleteNote as apiDeleteNote,
} from "../services/api";

export type Note = {
  id: string;
  title: string;
  content: string;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CreateNotePayload = {
  title: string;
  content: string;
  startAt?: string | null;
  endAt?: string | null;
};

export function useNotes(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setErrMsg(null);
    setLoading(true);
    try {
      const data = await apiFetchNotes();
      const list = Array.isArray(data) ? data : data?.notes ?? [];
      setNotes(list);
    } catch (e: any) {
      setErrMsg(e?.message ?? "讀取失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (payload: CreateNotePayload) => {
      setErrMsg(null);
      setLoading(true);
      try {
        await apiCreateNote(payload as any);
        // 建議：新增後直接重抓一次，避免前後端狀態不一致
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

  const remove = useCallback(async (id: string) => {
    setErrMsg(null);
    setLoading(true);
    try {
      await apiDeleteNote(id);
      // 直接前端移除（更快），也可改成 await refresh()
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return true;
    } catch (e: any) {
      setErrMsg(e?.message ?? "刪除失敗");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 自動載入
  useEffect(() => {
    if (autoFetch) refresh();
  }, [autoFetch, refresh]);

  return {
    notes,
    loading,
    errMsg,
    setErrMsg, // 讓 UI 需要時可清錯誤
    refresh,
    create,
    remove,
  };
}