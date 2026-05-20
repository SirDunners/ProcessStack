// src/tabs/PersonasTab.tsx
import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonasTab() {
  const {
    data,
    selectedPersonaId,
    setSelectedPersonaId,
    personaView,
    setPersonaView,
    createPersonaOpen,
    setCreatePersonaOpen,
    createPersonaDraft,
    setCreatePersonaDraft,
    createPersonaFromModal,
    openCreatePersona,
    closeCreatePersona,
    getAvatarForPersona,
  } = useProcessStackState();

  const selectedPersona = data.personas?.find(
    (p: any) => p.persona_id === selectedPersonaId
  );

  // ── Detail View ─────────────────────────────────────
  if (personaView === "detail" && selectedPersona) {
    return (
      <div style={{ padding: "20px" }}>
        <button
          onClick={() => setPersonaView("home")}
          style={{
            marginBottom: 20,
            padding: "8px 16px",
            background: "#f1f1f1",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Back to Personas
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src={getAvatarForPersona(selectedPersona).image_url}
            alt={selectedPersona.display_name}
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #111827",
            }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{selectedPersona.display_name}</h2>
            <p style={{ margin: 4, color: "#666", fontSize: 15 }}>
              {selectedPersona.persona_type} • {selectedPersona.status || "Active"}
            </p>
          </div>
        </div>

        <p style={{ marginTop: 24, lineHeight: 1.6, color: "#444" }}>
          {selectedPersona.description || "No description provided yet."}
        </p>
      </div>
    );
  }

  // ── List View ───────────────────────────────────────
  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={openCreatePersona}
        style={{
          padding: "10px 20px",
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        + New Persona
      </button>

      <div style={{ display: "grid", gap: 12 }}>
        {data.personas?.length === 0 ? (
          <div style={{ color: "#888" }}>No personas yet.</div>
        ) : (
          data.personas.map((persona: any) => (
            <div
              key={persona.persona_id}
              onClick={() => {
                setSelectedPersonaId(persona.persona_id);
                setPersonaView("detail");
              }}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "white",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
              }}
            >
              <img
                src={getAvatarForPersona(persona).image_url}
                alt={persona.display_name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{persona.display_name}</div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {persona.persona_id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Persona Modal */}
      {createPersonaOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              width: "90%",
              maxWidth: 420,
            }}
          >
            <h3>Create New Persona</h3>

            <input
              placeholder="Display Name"
              value={createPersonaDraft.display_name}
              onChange={(e) =>
                setCreatePersonaDraft((d) => ({ ...d, display_name: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 12,
                margin: "12px 0",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />

            <textarea
              placeholder="Description"
              value={createPersonaDraft.description}
              onChange={(e) =>
                setCreatePersonaDraft((d) => ({ ...d, description: e.target.value }))
              }
              style={{
                width: "100%",
                padding: 12,
                margin: "12px 0",
                borderRadius: 8,
                border: "1px solid #ccc",
                minHeight: 100,
              }}
            />

            <div style={{ margin: "12px 0" }}>
              <label>Type</label>
              <select
                value={createPersonaDraft.persona_type}
                onChange={(e) =>
                  setCreatePersonaDraft((d) => ({
                    ...d,
                    persona_type: e.target.value as any,
                  }))
                }
                style={{ width: "100%", padding: 12, marginTop: 4 }}
              >
                <option value="Human">Human</option>
                <option value="ServiceAccount">Service Account</option>
                <option value="Robot">Robot</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={closeCreatePersona}
                style={{ flex: 1, padding: 12, borderRadius: 8 }}
              >
                Cancel
              </button>
              <button
                onClick={createPersonaFromModal}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#111827",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                }}
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}