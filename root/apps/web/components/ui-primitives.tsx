import React from "react";

export function Panel({
  title,
  children
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: "white"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "#111827",
      color: "white",
      border: "1px solid #111827",
      padding: "8px 12px",
      borderRadius: 10,
      cursor: "pointer"
    },
    secondary: {
      background: "#f3f4f6",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "8px 12px",
      borderRadius: 10,
      cursor: "pointer"
    },
    ghost: {
      background: "transparent",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "6px 10px",
      borderRadius: 10,
      cursor: "pointer"
    }
  };

  return (
    <button
      onClick={onClick}
      style={{ ...styles[variant], opacity: disabled ? 0.5 : 1 }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb"
      }}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        resize: "vertical"
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "white"
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
