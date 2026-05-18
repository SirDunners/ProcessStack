import React from "react";
import { Panel, Button } from "../../components/ui-primitives";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonaSystemsPanel({ persona }) {
  const { setData } = useProcessStackState();

  return (
    <Panel title="Systems & Roles">
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        System mappings
      </div>

      {persona.system_mappings.length === 0 ? (
        <div style={{ color: "#6b7280", fontSize: 12 }}>No system mappings yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {persona.system_mappings.map((m, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 10,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{m.system}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {m.role_type}: {m.role_name}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    personas: d.personas.map((p) =>
                      p.persona_id === persona.persona_id
                        ? {
                            ...p,
                            system_mappings: p.system_mappings.filter(
                              (_, i) => i !== idx
                            ),
                          }
                        : p
                    ),
                  }))
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
