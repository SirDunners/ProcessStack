import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function SystemModulesPanel({ system }: any) {
  const { setData, Panel, Button, Input } = useProcessStackState();

  const [newModule, setNewModule] = useState("");

  const addModule = () => {
    if (!newModule.trim()) return;

    setData((d: any) => ({
      ...d,
      systems: (d.systems ?? []).map((s: any) =>
        s.id === system.id
          ? {
              ...s,
              modules: Array.from(new Set([...(s.modules ?? []), newModule.trim()])),
            }
          : s
      ),
    }));

    setNewModule("");
  };

  const removeModule = (m: string) => {
    setData((d: any) => ({
      ...d,
      systems: (d.systems ?? []).map((s: any) =>
        s.id === system.id
          ? {
              ...s,
              modules: (s.modules ?? []).filter((x: string) => x !== m),
            }
          : s
      ),
    }));
  };

  return (
    <Panel title="Modules">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            value={newModule}
            onChange={setNewModule}
            placeholder="Add module..."
          />
          <Button variant="secondary" onClick={addModule}>
            Add
          </Button>
        </div>

        {(system.modules ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No modules yet.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(system.modules ?? []).map((m: string) => (
              <div
                key={m}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span>{m}</span>
                <button
                  onClick={() => removeModule(m)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
