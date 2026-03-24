//處理筆記要怎麼被篩選、分類邏輯

import { useMemo } from "react";
import type { Note } from "./useNotes";

type Params = {
  notes: Note[];
  selectedTag: string | null;
  searchTerm: string;
};

// 根據 tag 和搜尋字串過濾筆記，並區分過期和未過期的提醒
export function useFilteredNotes({
  notes,
  selectedTag,
  searchTerm,
}: Params) {
  const filteredNotes = useMemo(() => {
    const txt = searchTerm.trim().toLowerCase();

    return notes.filter((n) => {
      if (selectedTag && n.tag !== selectedTag) return false;

      if (!txt) return true;
      if (n.title.toLowerCase().includes(txt)) return true;
      if (n.content.toLowerCase().includes(txt)) return true;

      return false;
    });
  }, [notes, selectedTag, searchTerm]);

  const { expiredNotes, activeNotes } = useMemo(() => {
    const now = Date.now();

    const expired: Note[] = [];
    const active: Note[] = [];

    for (const n of filteredNotes) {
      if (!n.endAt) {
        active.push(n);
        continue;
      }

      const endTime = new Date(n.endAt).getTime();

      if (Number.isNaN(endTime)) {
        active.push(n);
        continue;
      }

      if (endTime < now) expired.push(n);
      else active.push(n);
    }

    return {
      expiredNotes: expired,
      activeNotes: active,
    };
  }, [filteredNotes]);

  return {
    filteredNotes,
    expiredNotes,
    activeNotes,
  };
}