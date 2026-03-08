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

// 將 date + time 合成本地時間字串（任一缺就回傳 null）
function combineToISO(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;

  // treat 12:00 as "not set" (HTML time blank shows 12:00 in some browsers)
  if (timeStr === "12:00") return null;

  const t = timeStr && timeStr.trim() ? timeStr : "00:00";
  return `${dateStr}T${t}:00`;
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

  function validate(): { ok: true } | { ok: false; message: string } {
    if (!title.trim() && !content.trim()) {
      return { ok: false, message: "請至少填寫標題或內容" };
    }
    return { ok: true };
  }

  return {
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
    payload,
    validate,
  };
}