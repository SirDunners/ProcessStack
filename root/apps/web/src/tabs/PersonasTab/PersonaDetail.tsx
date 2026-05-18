import React from "react";
import PersonaAvatarPanel from "./PersonaAvatarPanel";
import PersonaProfilePanel from "./PersonaProfilePanel";
import PersonaSystemsPanel from "./PersonaSystemsPanel";
import PersonaTransactionsPanel from "./PersonaTransactionsPanel";

export default function PersonaDetail({ persona }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PersonaAvatarPanel persona={persona} />
        <PersonaProfilePanel persona={persona} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PersonaSystemsPanel persona={persona} />
        <PersonaTransactionsPanel persona={persona} />
      </div>
    </div>
  );
}
