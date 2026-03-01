import { useEffect, useMemo, useState } from "react";

export type NoteFormState = {
  title: string;
  content: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

// 將 date + time 合成 ISO 字串（任一缺就回傳 null）
function combineToISO(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  const dt = new Date(`${dateStr}T${timeStr}:00`); // 用本地時間組合
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export function useNoteForm(open: boolean) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // ✅ 每次打開 Modal 都重置（你原本 App 的 useEffect）
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
  }, [open]);

  // 組 payload（給 create 用）
  const payload = useMemo(() => {
    const startAt = combineToISO(startDate, startTime);
    const endAt = combineToISO(endDate, endTime);

    return {
      title: title.trim() || "(無標題)",
      content: content.trim(),
      startAt,
      endAt,
    };
  }, [title, content, startDate, startTime, endDate, endTime]);

  // 驗證：至少標題或內容要有一個
  function validate(): { ok: true } | { ok: false; message: string } {
    if (!title.trim() && !content.trim()) {
      return { ok: false, message: "請至少填寫標題或內容" };
    }
    return { ok: true };
  }

  return {
    // fields
    title,
    setTitle,
    content,
    setContent,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,

    // helpers
    payload,
    validate,
  };
}