export type Theme = {
  bg: string;
  panel: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  inputBg: string;
  btnBg: string;
};

export const darkTheme: Theme = {
  bg: "#1f1f1f",
  panel: "#1f1f1f",
  card: "#2a2a2a",
  text: "#f5f5f5",
  muted: "#b3b3b3",
  border: "#3a3a3a",
  inputBg: "#2a2a2a",
  btnBg: "#333333",
};

export const lightTheme: Theme = {
  bg: "#ffffff",
  panel: "#ffffff",
  card: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#dddddd",
  inputBg: "#ffffff",
  btnBg: "#f3f4f6",
};