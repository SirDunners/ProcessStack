import React from "react";
import { Panel, Button } from "../../components/ui-primitives";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonaAvatarPanel({ persona }) {
  const {
    getAvatarForPersona,
    setAvatarPickerOpen,
    setAvatarSearch,
  } = useProcessStackState();

  const av = getAvatarForPersona(persona);

  return (
    <Panel title="Synthesia Avatar">
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8 }}>
          {av ? (
            <img src={av.image_url} alt={`${av.name} - ${av.outfit}`} style={{ width: "100%", display: "block" }} />
          ) : (
            <div style={{ color: "#6b7280", fontSize: 12, padding: 10 }}>No avatar assigned</div>
          )}
        </div>

        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {av ? `${av.name} — ${av.outfit}` : "Choose an avatar from the bank"}
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setAvatarPickerOpen(false);
            setAvatarSearch("");
            setTimeout(() => setAvatarPickerOpen(true), 0);
          }}
        >
          Change avatar
        </Button>
      </div>
    </Panel>
  );
}
