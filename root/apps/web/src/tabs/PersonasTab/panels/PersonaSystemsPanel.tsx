import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaSystemsPanel({ persona }: any) {
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
      personas: (d.personas ?? []).map((p: any) =>
        p.persona_id === persona.persona_id
          ? {
              ...p,
              systems: Array.from(new Set([...(p.systems ?? []), id])),
            }
          : p
      ),
    }));
  };

  const removeSystem = (id: string) => {
    setData((d: any) => ({
      ...d,
      personas: (d.personas ?? []).map((p: any) =>
        p.persona_id === persona.persona_id
          ? {
              ...p,
              systems: (p.systems ?? []).filter((x: string) => x !== id),
            }
          : p
      ),
    }));
  };

  return (
    <Panel title="Systems Used">
      <div style={{ display: "grid", gap: 12 }}>
        <Select
          value=""
          onChange={addSystem}
          options={[{ value: "", label: "Add system..." }, ...systemOptions]}
        />

        {(persona.systems ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No systems linked.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {(persona.systems ?? []).map((sid: string) => {
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
