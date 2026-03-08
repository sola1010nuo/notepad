import React from "react";
import type { Theme } from "../styles/theme";

type Props = {
  open: boolean;
  theme: Theme;
  dark: boolean;
  setDark: (dark: boolean) => void;
  remindAdvanceMinutes: number;
  setRemindAdvanceMinutes: (minutes: number) => void;
  onClose: () => void;
};

export default function SettingsModal(props: Props) {
  const {
    open,
    theme,
    dark,
    setDark,
    remindAdvanceMinutes,
    setRemindAdvanceMinutes,
    onClose,
  } = props;

  const [remindOption, setRemindOption] = React.useState("30");
  const [customHours, setCustomHours] = React.useState("0");
  const [customMinutes, setCustomMinutes] = React.useState("30");

  // 每次 modal 打開 / 外部值變化時，同步顯示內容
  React.useEffect(() => {
    const hours = Math.floor(remindAdvanceMinutes / 60);
    const minutes = remindAdvanceMinutes % 60;

    setCustomHours(String(hours));
    setCustomMinutes(String(minutes));

    if (remindAdvanceMinutes === 10) setRemindOption("10");
    else if (remindAdvanceMinutes === 30) setRemindOption("30");
    else if (remindAdvanceMinutes === 60) setRemindOption("60");
    else if (remindAdvanceMinutes === 120) setRemindOption("120");
    else setRemindOption("custom");
  }, [remindAdvanceMinutes, open]);

  const handleSave = () => {
    let minutes = 0;

    if (remindOption === "custom") {
      const h = Math.max(0, parseInt(customHours, 10) || 0);
      const m = Math.max(0, parseInt(customMinutes, 10) || 0);

      minutes = h * 60 + m;
    } else {
      minutes = parseInt(remindOption, 10);
    }

    // 避免設定成 0 分鐘以下
    if (minutes < 1) {
      minutes = 1;
    }

    setRemindAdvanceMinutes(minutes);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        tabIndex={-1}
        style={{
          width: "min(500px, 100%)",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: theme.text }}>設定</h3>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${theme.border}`,
              background: "transparent",
              color: theme.text,
              borderRadius: 999,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gap: 20, marginTop: 16 }}>
          {/* 主題切換 */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: theme.text,
                fontWeight: 600,
              }}
            >
              主題
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDark(false)}
                style={{
                  padding: "8px 12px",
                  background: !dark ? theme.btnBg : "transparent",
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  opacity: !dark ? 1 : 0.6,
                }}
              >
                🔆 日間
              </button>
              <button
                onClick={() => setDark(true)}
                style={{
                  padding: "8px 12px",
                  background: dark ? theme.btnBg : "transparent",
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  opacity: dark ? 1 : 0.6,
                }}
              >
                🌙 夜間
              </button>
            </div>
          </div>

          {/* 提醒時間設定 */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: theme.text,
                fontWeight: 600,
              }}
            >
              提醒時間
            </label>

            <div style={{ color: theme.muted, fontSize: 14, marginBottom: 10 }}>
              到期限前多久跳提醒
            </div>

            <select
              value={remindOption}
              onChange={(e) => setRemindOption(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: theme.inputBg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                outline: "none",
              }}
            >
              <option value="10">10 分鐘前</option>
              <option value="30">30 分鐘前</option>
              <option value="60">1 小時前</option>
              <option value="120">2 小時前</option>
              <option value="custom">自訂</option>
            </select>

            {remindOption === "custom" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  >
                    小時
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: theme.inputBg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  >
                    分鐘
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: theme.inputBg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            取消
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: "8px 12px",
              background: theme.btnBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}