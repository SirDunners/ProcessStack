import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function ArchitectureSystemsPanel({ item }: any) {
  const { data, setData, Panel, Button, Select } = useProcessStackState();

  const systemOptions =
    (data.systems ?? []).map((s: any) => ({
      value: s.id,
      label: s.name,
    })) ?? [];

  const addSystem = (id: string) => {
    if (!id) return;
    setData((d: any) => ({
      ...d,
      architecture: (d.architecture ?? []).map((a: any) =>
        a.id === item.id
          ? {
              ...a,
              systems: Array.from(new Set([...(a.systems ?? []), id])),
            }
          : a
      ),
    }));
  };

  const removeSystem = (id: string) => {
    setData((d: any) => ({
      ...d,
      architecture: (d.architecture ?? []).map((a: any) =>
        a.id === item.id
          ? {
              ...a,
              systems: (a.systems ?? []).filter((x: string) => x !== id),
            }
          : a
      ),
    }));
  };

  return (
    <Panel title="Systems">
      <div style={{ display: "grid", gap: 12 }}>
        <Select
          value=""
          onChange={addSystem}
          options={[{ value: "", label: "Add system..." }, ...systemOptions]}
        />

        {(item.systems ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No systems linked.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {(item.systems ?? []).map((sid: string) => {
              const sys = (data.systems ?? []).find((s: any) => s.id === sid);
              return (
                <div
                  key={sid}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>{sys?.name ?? sid}</div>
                  <Button variant="ghost" onClick={() => removeSystem(sid)}>
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
