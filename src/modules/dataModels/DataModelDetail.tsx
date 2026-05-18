import React, { useMemo, useState } from "react";

/**
 * DataModelDetail (Module)
 * - Shows a single Data Model (compact summary strip + Fields as the main course)
 * - Field rows have hover + click to open a Field detail view
 * - Edit Model uses a modal (re-uses the create-model form shape) but (recommended) only edits version/status/description
 */

// ================================================
// START - Type Definitions
// ================================================
export type DataModelDetailProps = {
  model: any;
  updateModel: (updater: (m: any) => any) => void;
  onBack: () => void;
  onDelete: () => void;

  // Field navigation
  onOpenField: (field_id: string) => void;

  // Field CRUD
  onAddField: (field: any) => void;
  onRemoveField: (field_id: string) => void;

  // For generating internal field_id (ModelId.001)
  nextFieldId: (model_id: string, fields: any[]) => string;

  // UI primitives
  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  Input: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Textarea: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Select: React.ComponentType<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }>;

  // Options
  statusOptions: { value: string; label: string }[];
  fieldStatusOptions: { value: string; label: string }[];
  standardCustomOptions: { value: string; label: string }[];
  fieldTypeOptions: { value: string; label: string }[];
};
// ================================================
// END - Type Definitions
// ================================================

// ================================================
// START - Helper Functions
// ================================================
function displayModelName(m: any) {
  return `${m.system} > ${m.entity}`;
}
// ================================================
// END - Helper Functions
// ================================================

export default function DataModelDetail(props: DataModelDetailProps) {
  const {
    model,
    updateModel,
    onBack,
    onDelete,
    onOpenField,
    onAddField,
    onRemoveField,
    nextFieldId,
    Panel,
    Button,
    Input,
    Textarea,
    Select,
    statusOptions,
    fieldStatusOptions,
    standardCustomOptions,
    fieldTypeOptions,
  } = props;

  // ================================================
  // START - Local State
  // ================================================
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [hoveredFieldId, setHoveredFieldId] = useState<string>("");

  // Edit model modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<{ version: string; status: string; description: string }>({
    version: model.version ?? "1.0",
    status: model.status ?? "Draft",
    description: model.description ?? "",
  });

  // Add field form
  const [fieldDraft, setFieldDraft] = useState<{
    source_field_code: string;
    label: string;
    type: string;
    status: string;
    standard_custom: string;
    length: string;
    order: string;
    description: string;
    enum_csv: string;
    reference_to: string;
  }>({
    source_field_code: "",
    label: "",
    type: "string",
    status: "Approved",
    standard_custom: "Custom",
    length: "",
    order: "",
    description: "",
    enum_csv: "",
    reference_to: "",
  });
  // ================================================
  // END - Local State
  // ================================================

  // ================================================
  // START - Computed Data
  // ================================================
  const fields = (model.fields ?? []) as any[];

  const previewFieldId = useMemo(() => {
    try {
      return nextFieldId(model.model_id, fields);
    } catch {
      return "(auto)";
    }
  }, [model.model_id, fields, nextFieldId]);
  // ================================================
  // END - Computed Data
  // ================================================

  // ================================================
  // START - Helper Functions (inside component)
  // ================================================
  function openEdit() {
    setEditDraft({
      version: model.version ?? "1.0",
      status: model.status ?? "Draft",
      description: model.description ?? "",
    });
    setEditOpen(true);
  }

  function saveEdit() {
    updateModel((m) => ({
      ...m,
      version: (editDraft.version ?? "").trim() || m.version,
      status: editDraft.status,
      description: (editDraft.description ?? "").trim(),
    }));
    setEditOpen(false);
  }

  function resetFieldDraft() {
    setFieldDraft({
      source_field_code: "",
      label: "",
      type: "string",
      status: "Approved",
      standard_custom: "Custom",
      length: "",
      order: "",
      description: "",
      enum_csv: "",
      reference_to: "",
    });
  }

  function addField() {
    const label = fieldDraft.label.trim();
    const sourceCode = fieldDraft.source_field_code.trim();
    if (!label) return;

    // prevent duplicate source code (optional)
    if (sourceCode) {
      const dupeSource = fields.some((f) => String(f.source_field_code ?? "").toLowerCase() === sourceCode.toLowerCase());
      if (dupeSource) {
        alert(`Source field code already exists in this model: ${sourceCode}`);
        return;
      }
    }

    const enum_values =
      fieldDraft.type === "enum"
        ? fieldDraft.enum_csv
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : undefined;

    const lengthNum = fieldDraft.length.trim() ? Number(fieldDraft.length.trim()) : undefined;
    const orderNum = fieldDraft.order.trim() ? Number(fieldDraft.order.trim()) : undefined;

    const newField = {
      field_id: previewFieldId,
      source_field_code: sourceCode || undefined,
      label,
      type: fieldDraft.type,
      description: fieldDraft.description.trim() || "",
      status: fieldDraft.status,
      standard_custom: fieldDraft.standard_custom,
      length: Number.isFinite(lengthNum as any) ? lengthNum : undefined,
      order: Number.isFinite(orderNum as any) ? orderNum : undefined,
      enum_values,
      reference_to: fieldDraft.type === "reference" ? (fieldDraft.reference_to.trim() || undefined) : undefined,
    };

    onAddField(newField);
    resetFieldDraft();
    setAddFieldOpen(false);
  }
  // ================================================
  // END - Helper Functions (inside component)
  // ================================================

  return (
    <Panel title="Data Models">
      <div style={{ display: "grid", gap: 12 }}>
 
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={onBack}>
            ← Back to {displayModelName(model)}
          </Button>

          {onDelete ? (
            <Button variant="ghost" onClick={onDelete}>
              Delete Model
            </Button>
          ) : null}
        </div>

        {/* ===================== MODEL SUMMARY (START) ===================== */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "white",
            padding: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{displayModelName(model)}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{model.model_id}</div>
            </div>
            <Button variant="secondary" onClick={openEdit}>
              Edit
            </Button>
          </div>

          <div style={{ fontSize: 13, color: "#6b7280" }}>
            <span style={{ fontFamily: "monospace" }}>{model.system}</span>
            {"  •  "}
            <span style={{ fontFamily: "monospace" }}>{model.entity}</span>
            {"  •  "}
            <span>Status: {model.status}</span>
            {"  •  "}
            <span>Version: {model.version}</span>
          </div>

          {String(model.description ?? "").trim() ? (
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {String(model.description).trim().length > 180
                ? String(model.description).trim().slice(0, 180) + "…"
                : String(model.description).trim()}
            </div>
          ) : null}
        </div>
        {/* ===================== MODEL SUMMARY (END) ======================= */}

        {/* ===================== FIELDS GRID (START) ==================== */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Fields</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Internal Field ID + Source Field Code + Label.</div>
            </div>
            <Button
              variant={addFieldOpen ? "ghost" : "secondary"}
              onClick={() => {
                if (!addFieldOpen) resetFieldDraft();
                setAddFieldOpen((v) => !v);
              }}
            >
              {addFieldOpen ? "Close" : "+ Add Field"}
            </Button>
          </div>

          {addFieldOpen ? (
            <div style={{ border: "1px solid #f3f4f6", borderRadius: 12, padding: 12, background: "#fcfcfd" }}>
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr 160px", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Field ID (auto)</div>
                  <div style={{ fontFamily: "monospace", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>
                    {previewFieldId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Source field code</div>
                  <Input value={fieldDraft.source_field_code} onChange={(v) => setFieldDraft((d) => ({ ...d, source_field_code: v }))} placeholder="e.g., JobCode" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Label</div>
                  <Input value={fieldDraft.label} onChange={(v) => setFieldDraft((d) => ({ ...d, label: v }))} placeholder="e.g., Job Code" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Field Type</div>
                  <Select value={fieldDraft.type} onChange={(v) => setFieldDraft((d) => ({ ...d, type: v }))} options={fieldTypeOptions} />
                </div>
              </div>

              <div style={{ height: 10 }} />

              <div style={{ display: "grid", gridTemplateColumns: "220px 220px 140px 140px 1fr", gap: 10, alignItems: "end" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Status</div>
                  <Select value={fieldDraft.status} onChange={(v) => setFieldDraft((d) => ({ ...d, status: v }))} options={fieldStatusOptions} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Standard/Custom</div>
                  <Select value={fieldDraft.standard_custom} onChange={(v) => setFieldDraft((d) => ({ ...d, standard_custom: v }))} options={standardCustomOptions} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Field length</div>
                  <Input value={fieldDraft.length} onChange={(v) => setFieldDraft((d) => ({ ...d, length: v }))} placeholder="e.g., 255" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Order</div>
                  <Input value={fieldDraft.order} onChange={(v) => setFieldDraft((d) => ({ ...d, order: v }))} placeholder="e.g., 1" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description (optional)</div>
                  <Input value={fieldDraft.description} onChange={(v) => setFieldDraft((d) => ({ ...d, description: v }))} placeholder="Business meaning" />
                </div>
              </div>

              {fieldDraft.type === "enum" ? (
                <>
                  <div style={{ height: 10 }} />
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Enum values (comma)</div>
                    <Input value={fieldDraft.enum_csv} onChange={(v) => setFieldDraft((d) => ({ ...d, enum_csv: v }))} placeholder="e.g., Draft, Approved, Rejected" />
                  </div>
                </>
              ) : null}

              {fieldDraft.type === "reference" ? (
                <>
                  <div style={{ height: 10 }} />
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Reference to (model_id)</div>
                    <Input value={fieldDraft.reference_to} onChange={(v) => setFieldDraft((d) => ({ ...d, reference_to: v }))} placeholder="e.g., SuccessFactors.Position" />
                  </div>
                </>
              ) : null}

              <div style={{ height: 10 }} />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => { resetFieldDraft(); setAddFieldOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={addField} disabled={!fieldDraft.label.trim()}>
                  Add field
                </Button>
              </div>
            </div>
          ) : null}

          {fields.length === 0 ? (
            <div style={{ fontSize: 12, color: "#6b7280" }}>No fields yet. Click “+ Add Field”.</div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflowX: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 180px 220px 120px 140px 110px 90px 140px 1fr 100px",
                  padding: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                  minWidth: 1400,
                }}
              >
                <div>Field ID</div>
                <div>Source code</div>
                <div>Label</div>
                <div>Status</div>
                <div>Standard/Custom</div>
                <div>Length</div>
                <div>Order</div>
                <div>Field Type</div>
                <div>Description</div>
                <div style={{ textAlign: "right" }}>Remove</div>
              </div>

              {fields.map((f) => (
                <button
                  key={f.field_id}
                  type="button"
                  onClick={() => onOpenField(f.field_id)}
                  onMouseEnter={() => setHoveredFieldId(f.field_id)}
                  onMouseLeave={() => setHoveredFieldId("")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "white",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  title={`Open ${f.field_id}`}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "260px 180px 220px 120px 140px 110px 90px 140px 1fr 100px",
                      padding: 10,
                      borderBottom: "1px solid #f3f4f6",
                      alignItems: "center",
                      minWidth: 1400,
                      fontSize: 14,
                      fontWeight: 400,
                      background: hoveredFieldId === f.field_id ? "#f3f4f6" : "white",
                    }}
                  >
                    <div style={{ fontFamily: "monospace", color: "#6b7280" }}>{f.field_id}</div>
                    <div style={{ fontFamily: "monospace" }}>{f.source_field_code ?? ""}</div>
                    <div>{f.label}</div>
                    <div>{f.status ?? ""}</div>
                    <div style={{ fontFamily: "monospace" }}>{f.standard_custom ?? ""}</div>
                    <div style={{ fontFamily: "monospace" }}>{typeof f.length === "number" ? String(f.length) : ""}</div>
                    <div style={{ fontFamily: "monospace" }}>{typeof f.order === "number" ? String(f.order) : ""}</div>
                    <div style={{ fontFamily: "monospace" }}>{f.type}</div>
                    <div style={{ color: "#6b7280" }}>{f.description ?? ""}</div>
                    <div style={{ textAlign: "right" }}>

                    <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={{ textAlign: "right" }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onRemoveField(f.field_id);
                          }}
                        >
                          Remove
                        </Button>
                      </div>

                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ===================== FIELDS GRID (END) ====================== */}

        {/* Edit Model Modal */}
        {editOpen ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 20000,
            }}
          >
            <div
              style={{
                width: "min(760px, 96vw)",
                background: "white",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                padding: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Edit Data Model</div>
                <Button variant="secondary" onClick={() => setEditOpen(false)}>
                  Close
                </Button>
              </div>

              <div style={{ height: 12 }} />

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System</div>
                    <div style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>{model.system}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Entity</div>
                    <div style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>{model.entity}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Version</div>
                    <Input value={editDraft.version} onChange={(v) => setEditDraft((d) => ({ ...d, version: v }))} placeholder="1.0" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Status</div>
                    <Select value={editDraft.status} onChange={(v) => setEditDraft((d) => ({ ...d, status: v }))} options={statusOptions} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Internal ID</div>
                    <div style={{ fontFamily: "monospace", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>
                      {model.model_id}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description (optional)</div>
                  <Textarea value={editDraft.description} onChange={(v) => setEditDraft((d) => ({ ...d, description: v }))} placeholder="What does this entity represent?" />
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit}>
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}