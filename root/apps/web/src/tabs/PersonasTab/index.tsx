import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

import { Panel, Button } from "../../components/ui-primitives";
import { AvatarPickerModal, CreatePersonaModal } from "../../components/modals";

import PersonaList from "./PersonaList";
import PersonaDetail from "./PersonaDetail";

export default function PersonasTab() {
  const {
    data,
    personaView,
    setPersonaView,
    selectedPersonaId,

    // persona creation
    createPersonaOpen,
    closeCreatePersona,
    openCreatePersona,
    createPersonaDraft,
    setCreatePersonaDraft,
    createPersonaFromModal,

    // avatar picker
    avatarPickerOpen,
    setAvatarPickerOpen,
    avatarSearch,
    setAvatarSearch,
  } = useProcessStackState();

  const selectedPersona = data.personas.find(
    (p) => p.persona_id === selectedPersonaId
  );

  return (
    <Panel title="Personas">
      {/* ========================= */}
      {/* Avatar Picker Modal */}
      {/* ========================= */}
      <AvatarPickerModal
        open={avatarPickerOpen}
        onClose={() => {
          setAvatarPickerOpen(false);
          setAvatarSearch("");
        }}
        selectedAvatarId={
          createPersonaOpen
            ? createPersonaDraft.avatar_id
            : selectedPersona?.avatar_id
        }
        search={avatarSearch}
        setSearch={setAvatarSearch}
      />

      {/* ========================= */}
      {/* Create Persona Modal */}
      {/* ========================= */}
      <CreatePersonaModal
        open={createPersonaOpen}
        onClose={closeCreatePersona}
        draft={createPersonaDraft}
        setDraft={setCreatePersonaDraft}
        onCreate={createPersonaFromModal}
        onChooseAvatar={() => {
          setAvatarSearch("");
          setAvatarPickerOpen(true);
        }}
      />

      {/* ========================= */}
      {/* HOME VIEW */}
      {/* ========================= */}
      {personaView === "home" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Personas across all processes
            </div>

            <Button variant="secondary" onClick={openCreatePersona}>
              + Add Persona
            </Button>
          </div>

          <PersonaList />
        </div>
      )}

      {/* ========================= */}
      {/* DETAIL VIEW */}
      {/* ========================= */}
      {personaView === "detail" && (
        <div style={{ display: "grid", gap: 12 }}>
          <Button variant="secondary" onClick={() => setPersonaView("home")}>
            ← Back to Personas
          </Button>

          {!selectedPersona ? (
            <div style={{ color: "#6b7280" }}>No persona selected.</div>
          ) : (
            <PersonaDetail persona={selectedPersona} />
          )}
        </div>
      )}
    </Panel>
  );
}
