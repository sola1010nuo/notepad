import { useEffect, useMemo, useState } from "react";

export type NoteFormState = {
  title: string;
  content: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tag: string;
  remind: boolean;
};

// 將 date + time 合成 ISO 字串（任一缺就回傳 null）
function combineToISO(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);
    return dt.toISOString();
  } catch {
    return null;
  }
}

export function useNoteForm(open: boolean) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tag, setTag] = useState("");
  const [remind, setRemind] = useState(false);

  // 每次打開 Modal 都重置表單
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setTag("");
    setRemind(false);
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
      tag: tag.trim() || null,
      remind: remind ? 1 : 0,
    };
  }, [title, content, startDate, startTime, endDate, endTime, tag, remind]);

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
    tag,
    setTag,
    remind,
    setRemind,

    // helpers
    payload,
    validate,
  };
}