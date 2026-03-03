import React from "react";
import type { Theme } from "../styles/theme";

type SidebarProps = {
  theme: Theme;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

export default function Sidebar(props: SidebarProps) {
  const { theme, allTags, selectedTag, onSelectTag } = props;

  return (
    <div
      style={{
        width: 200,
        paddingRight: 16,
      }}
    >
      <div style={{ fontSize: 12, color: theme.muted, marginBottom: 12, fontWeight: "bold" }}>
      </div>

      <button
        onClick={() => onSelectTag(null)}
        style={{
          display: "block",
          width: "100%",
          padding: "8px 12px",
          marginBottom: 8,
          textAlign: "left",
          background: selectedTag === null ? theme.inputBg : "transparent",
          color: selectedTag === null ? "#f59e0b" : theme.text,
          border: `1px solid ${selectedTag === null ? "#f59e0b" : theme.border}`,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: selectedTag === null ? "bold" : "normal",
          transition: "all 0.2s",
        }}
      >
        全部
      </button>

      <div style={{ fontSize: 11, color: theme.muted, marginBottom: 8, fontWeight: "bold" }}>
        標籤
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {allTags.length === 0 ? (
          <div style={{ fontSize: 12, color: theme.muted }}>還沒有標籤</div>
        ) : (
          allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              style={{
                display: "block",
                width: "100%",
                padding: "6px 10px",
                textAlign: "left",
                background: selectedTag === tag ? theme.inputBg : "transparent",
                color: selectedTag === tag ? "#f59e0b" : theme.text,
                border: `1px solid ${selectedTag === tag ? "#f59e0b" : theme.border}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: selectedTag === tag ? "bold" : "normal",
                transition: "all 0.2s",
              }}
            >
              🏷️ {tag}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
