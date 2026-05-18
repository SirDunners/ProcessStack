import React from "react";
import { Button, Input, Textarea, Select } from "./ui-primitives";
import type { PersonaType, SystemModel, SystemCategory } from "../utils/domain";
import { AVATAR_BANK } from "../avatarBank";

// ======================================================
// Avatar Picker Modal
// ======================================================
export function AvatarPickerModal({
  open,
  onClose,
  onSelect,
  selectedAvatarId,
  search,
  setSearch
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (avatarId: string) => void;
  selectedAvatarId?: string;
  search: string;
  setSearch: (v: string) => void;
}) {
  if (!open) return null;

  const filtered = AVATAR_BANK.filter((a) => {
    const hay = `${a.name} ${a.outfit}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 20000
      }}
    >
      <div
        style={{
          width: "min(980px, 96vw)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "white",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          padding: 16
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Choose Synthesia Avatar</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ marginTop: 10 }}>
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search by name or outfit (e.g. 'Ada', 'blazer')..."
          />
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          {filtered.map((a) => {
            const selected = a.avatar_id === selectedAvatarId;
            return (
              <div
                key={a.avatar_id}
                onClick={() => onSelect(a.avatar_id)}
                style={{
                  cursor: "pointer",
                  border: selected ? "2px solid #111827" : "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "white"
                }}
              >
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: 12,
                    overflow: "hidden",
                    padding: 8
                  }}
                >
                  <img
                    src={a.image_url}
                    alt={`${a.name} - ${a.outfit}`}
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{a.outfit}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// Create Persona Modal (full version)
// ======================================================
export function CreatePersonaModal({
  open,
  onClose,
  draft,
  setDraft,
  onCreate,
  onChooseAvatar,
  avatarSummary
}: {
  open: boolean;
  onClose: () => void;
  draft: {
    display_name: string;
    description: string;
    persona_type: PersonaType;
    avatar_id: string;
  };
  setDraft: React.Dispatch<
    React.SetStateAction<{
      display_name: string;
      description: string;
      persona_type: PersonaType;
      avatar_id: string;
    }>
  >;
  onCreate: () => void;
  onChooseAvatar: () => void;
  avatarSummary: string;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999
      }}
    >
      <div
        style={{
          width: "min(720px, 96vw)",
          background: "white",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          padding: 16
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Create Persona</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Display name</div>
            <Input
              value={draft.display_name}
              onChange={(v) => setDraft((d) => ({ ...d, display_name: v }))}
              placeholder="e.g., HR Administrator"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Persona type</div>
            <Select
              value={draft.persona_type}
              onChange={(v) => setDraft((d) => ({ ...d, persona_type: v as PersonaType }))}
              options={[
                { value: "Human", label: "Human" },
                { value: "ServiceAccount", label: "ServiceAccount" },
                { value: "Robot", label: "Robot" },
                { value: "ExternalEntity", label: "ExternalEntity" }
              ]}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description</div>
            <Textarea
              value={draft.description}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              placeholder="Short description"
            />
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Synthesia Avatar</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{avatarSummary}</div>
              </div>
              <Button variant="secondary" onClick={onChooseAvatar}>
                Choose avatar
              </Button>
            </div>
          </div>

          <Button onClick={onCreate}>Create Persona</Button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// Create System Modal
// ======================================================
export function CreateSystemModal({
  open,
  onClose,
  draft,
  setDraft,
  onCreate,
  newModule,
  setNewModule,
  onAddModule,
  onRemoveModule
}: {
  open: boolean;
  onClose: () => void;
  draft: SystemModel;
  setDraft: React.Dispatch<React.SetStateAction<SystemModel>>;
  onCreate: () => void;
  newModule: string;
  setNewModule: (v: string) => void;
  onAddModule: () => void;
  onRemoveModule: (moduleName: string) => void;
}) {
  if (!open) return null;

  const categoryOptions: { value: SystemCategory; label: string }[] = [
    { value: "HRIS", label: "HRIS" },
    { value: "ATS", label: "ATS" },
    { value: "Assessment", label: "Assessment" },
    { value: "Portal", label: "Portal" },
    { value: "Integration", label: "Integration" },
    { value: "Identity", label: "Identity" },
    { value: "Analytics", label: "Analytics" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 15000
      }}
    >
      <div
        style={{
          width: "min(760px, 96vw)",
          background: "white",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          padding: 16
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Add System</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System name</div>
            <Input
              value={draft.name}
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              placeholder="e.g., SuccessFactors / Workday / Avature"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Category</div>
            <Select
              value={draft.category}
              onChange={(v) => setDraft((d) => ({ ...d, category: v as SystemCategory }))}
              options={categoryOptions}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Modules (multi-select)</div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={newModule}
                  onChange={setNewModule}
                  placeholder="Type a module (e.g., Recruiting) then click Add"
                />
              </div>
              <Button variant="secondary" onClick={onAddModule}>
                Add
              </Button>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 8
              }}
            >
              {draft.modules.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  No modules added yet.
                </div>
              ) : (
                draft.modules.map((m) => (
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
                      fontSize: 12
                    }}
                  >
                    <span>{m}</span>
                    <button
                      onClick={() => onRemoveModule(m)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#6b7280"
                      }}
                      aria-label={`Remove ${m}`}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              Description (optional)
            </div>
            <Textarea
              value={draft.description || ""}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              placeholder="Short notes about what this system does"
            />
          </div>

          <Button onClick={onCreate}>Create System</Button>
        </div>
      </div>
    </div>
  );
}
