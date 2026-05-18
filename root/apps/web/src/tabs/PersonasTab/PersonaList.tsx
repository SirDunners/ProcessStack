import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import { Panel } from "../../components/ui-primitives";

export default function PersonaList() {
  const {
    data,
    setSelectedPersonaId,
    setPersonaView,
    getAvatarForPersona,
  } = useProcessStackState();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
      {data.personas
        .filter((p) => p.status === "Active")
        .map((p) => {
          const av = getAvatarForPersona(p);
          return (
            <div
              key={p.persona_id}
              onClick={() => {
                setSelectedPersonaId(p.persona_id);
                setPersonaView("detail");
              }}
              style={{
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: "white",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 800 }}>{p.display_name}</div>
              <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8, minHeight: 140 }}>
                {av ? (
                  <img src={av.image_url} alt={`${av.name} - ${av.outfit}`} style={{ width: "100%", display: "block" }} />
                ) : (
                  <div style={{ color: "#6b7280", fontSize: 12, padding: 10 }}>No avatar assigned</div>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {p.persona_id} • {p.persona_type}
              </div>
            </div>
          );
        })}
    </div>
  );
}
