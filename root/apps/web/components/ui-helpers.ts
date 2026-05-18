import type { StepType } from "../utils/domain";

export function badgeStyle(kind: StepType) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #ddd",
    marginRight: 8
  };

  if (kind === "data") {
    return { ...base, background: "#e7f0ff", borderColor: "#bcd3ff" };
  }

  if (kind === "navigation") {
    return { ...base, background: "#f4f4f4" };
  }

  return { ...base, background: "#fff7e6", borderColor: "#ffd89b" };
}
