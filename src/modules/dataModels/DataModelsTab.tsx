import React, { useEffect, useMemo, useState } from "react";
import DataModelsList from "./DataModelsList";
import DataModelDetail from "./DataModelDetail";
import DataFieldDetail from "./DataFieldDetail";

/**
 * DataModelsTab (Controller) — Option A
 * - List -> Model Detail -> Field Detail
 * - Owns: navigation state + create-model modal + persistence mutations
 */

export type DataModelsTabProps = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;

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
};

type ModelStatus = "Draft" | "Active" | "Deprecated";

type FieldStatus = "Draft" | "Approved" | "Deprecated";

type StandardCustom = "Standard" | "Custom";

type FieldType = "string" | "number" | "date" | "boolean" | "enum" | "reference" | "object";

type DataField = {
  field_id: string; // internal stable id: ModelId.001
  source_field_code?: string; // e.g. JobCode
  label: string; // e.g. Job Code
  type: FieldType;
  description?: string;

  status?: FieldStatus;
  standard_custom?: StandardCustom;
  length?: number;
  order?: number;

  enum_values?: string[];
  reference_to?: string;
};

type DataModel = {
  model_id: string; // internal id: System.Entity (spaces removed)
  system: string; // display system name (from Architecture)
  entity: string; // display entity name (user-friendly)
  version: string;
  status: ModelStatus;
  description?: string;
  fields: DataField[];
};

function normalizeSystem(s: string) {
  return (s || "").trim();
}

function normalizeEntity(s: string) {
  return (s || "").trim();
}

function makeModelId(system: string, entity: string) {
  // internal id: System.Entity, with whitespace removed
  const sys = normalizeSystem(system).replace(/\s+/g, "");
  const ent = normalizeEntity(entity).replace(/\s+/g, "");
  return `${sys}.${ent}`;
}

function nextFieldId(model_id: string, fields: any[]) {
  // ModelId.001
  const esc = model_id.replace(/\./g, "\\.");
  const re = new RegExp(`^${esc}\\.(\\d+)$`);
  let maxN = 0;
  (fields ?? []).forEach((f: any) => {
    const fid = String(f?.field_id ?? "").trim();
    const m = fid.match(re);
    if (m?.[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) maxN = Math.max(maxN, n);
    }
  });
  const next = maxN + 1;
  return `${model_id}.${String(next).padStart(3, "0")}`;
}

export default function DataModelsTab(props: DataModelsTabProps) {
  const { data, setData, Panel, Button, Input, Textarea, Select } = props;

  const models: DataModel[] = useMemo(() => {
    const arr = (data as any)?.data_models;
    return Array.isArray(arr) ? (arr as DataModel[]) : [];
  }, [data]);

  // Architecture systems list
  const architectureSystemOptions = useMemo(() => {
    const arr = (data?.systems ?? []) as any[];
    const names = arr.map((s) => (s?.name ?? "").trim()).filter(Boolean);
    const uniq = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    return uniq.map((name) => ({ value: name, label: name }));
  }, [data?.systems]);

  // -------------------------
  // Navigation state
  // -------------------------
  const [view, setView] = useState<"list" | "model" | "field">("list");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  // List filters
  const [search, setSearch] = useState("");
  const [systemFilter, setSystemFilter] = useState<string>("");

  // -------------------------
  // Create model modal (GLOBAL)
  // -------------------------
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<{ system: string; entity: string; version: string; status: ModelStatus; description: string }>({
    system: "",
    entity: "",
    version: "1.0",
    status: "Draft",
    description: "",
  });

  const statusOptions = useMemo(
    () => [
      { value: "Draft", label: "Draft" },
      { value: "Active", label: "Active" },
      { value: "Deprecated", label: "Deprecated" },
    ],
    []
  );

  const fieldStatusOptions = useMemo(
    () => [
      { value: "Approved", label: "Approved" },
      { value: "Draft", label: "Draft" },
      { value: "Deprecated", label: "Deprecated" },
    ],
    []
  );

  const standardCustomOptions = useMemo(
    () => [
      { value: "Standard", label: "Standard" },
      { value: "Custom", label: "Custom" },
    ],
    []
  );

  const fieldTypeOptions: { value: FieldType; label: string }[] = useMemo(
    () => [
      { value: "string", label: "Single Line Text" },
      { value: "number", label: "Number" },
      { value: "date", label: "Date" },
      { value: "boolean", label: "TRUE/FALSE" },
      { value: "enum", label: "Single Option" },
      { value: "reference", label: "Reference" },
      { value: "object", label: "Object" },
    ],
    []
  );

  // -------------------------
  // Derived selection
  // -------------------------
  const selectedModel: DataModel | undefined = useMemo(() => {
    return models.find((m) => m.model_id === selectedModelId) ?? undefined;
  }, [models, selectedModelId]);

  const selectedField = useMemo(() => {
    if (!selectedModel) return undefined;
    return (selectedModel.fields ?? []).find((f: any) => f.field_id === selectedFieldId);
  }, [selectedModel, selectedFieldId]);

  // Keep selection valid
  useEffect(() => {
    if (view === "list") return;
    if (!selectedModelId) return;

    const stillExists = models.some((m) => m.model_id === selectedModelId);
    if (!stillExists) {
      setSelectedModelId("");
      setSelectedFieldId("");
      setView("list");
    }
  }, [models, selectedModelId, view]);

  // -------------------------
  // CRUD helpers
  // -------------------------
  function openCreateModel() {
    setCreateDraft({ system: "", entity: "", version: "1.0", status: "Draft", description: "" });
    setCreateOpen(true);
  }

  function createModelFromModal() {
    const system = normalizeSystem(createDraft.system);
    const entity = normalizeEntity(createDraft.entity);
    if (!system || !entity) return;

    const model_id = makeModelId(system, entity);
    const exists = models.some((m) => m.model_id.toLowerCase() === model_id.toLowerCase());
    if (exists) {
      alert(`Model already exists: ${model_id}`);
      return;
    }

    const newModel: DataModel = {
      model_id,
      system,
      entity,
      version: (createDraft.version || "1.0").trim() || "1.0",
      status: createDraft.status,
      description: createDraft.description.trim() || "",
      fields: [],
    };

    setData((d: any) => {
      const arr: DataModel[] = Array.isArray(d.data_models) ? d.data_models : [];
      return { ...d, data_models: [newModel, ...arr] };
    });

    // Auto-open the created model
    setSelectedModelId(model_id);
    setSelectedFieldId("");
    setView("model");
    setCreateOpen(false);
  }

  function updateModel(model_id: string, updater: (m: DataModel) => DataModel) {
    setData((d: any) => {
      const arr: DataModel[] = Array.isArray(d.data_models) ? d.data_models : [];
      return {
        ...d,
        data_models: arr.map((m) => (m.model_id === model_id ? updater(m) : m)),
      };
    });
  }

  function deleteModel(model_id: string) {
    setData((d: any) => {
      const arr: DataModel[] = Array.isArray(d.data_models) ? d.data_models : [];
      return { ...d, data_models: arr.filter((m) => m.model_id !== model_id) };
    });

    if (selectedModelId === model_id) {
      setSelectedModelId("");
      setSelectedFieldId("");
      setView("list");
    }
  }

  // Field usage (read-only) for Field detail page
  function getFieldUsage(modelId: string, fieldId: string) {
    const out: any[] = [];

    (data.transactions ?? []).forEach((t: any) => {
      (t.steps ?? []).forEach((s: any) => {
        if (s.type !== "data") return;
        if ((s.data_model_ref ?? "") !== modelId) return;

        const req: string[] = s.required_fields ?? [];
        if (!req.includes(fieldId)) return;

        out.push({
          transaction_id: t.transaction_id,
          transaction_name: t.name,
          step_id: s.id,
          step_action: s.action,
          step_type: s.type,
          model_ref: s.data_model_ref,
        });
      });
    });

    return out;
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <Panel title="Data Models">
      {view === "list" ? (
        <DataModelsList
          models={models}
          architectureSystemOptions={architectureSystemOptions}
          search={search}
          setSearch={setSearch}
          systemFilter={systemFilter}
          setSystemFilter={setSystemFilter}
          onCreateModel={openCreateModel}
          onOpenModel={(model_id) => {
            setSelectedModelId(model_id);
            setSelectedFieldId("");
            setView("model");
          }}
          Panel={Panel}
          Button={Button}
          Input={Input}
          Select={Select}
        />
      ) : view === "model" ? (
        selectedModel ? (
          <DataModelDetail
            model={selectedModel}
            updateModel={(updater) => updateModel(selectedModel.model_id, updater)}
            onBack={() => {
              setView("list");
              setSelectedFieldId("");
            }}
            onDelete={() => {
              const ok = window.confirm(`Delete model ${selectedModel.model_id}?`);
              if (!ok) return;
              deleteModel(selectedModel.model_id);
              setSelectedFieldId("");
              setView("list");
            }}
            onOpenField={(field_id) => {
              setSelectedFieldId(field_id);
              setView("field");
            }}
            onAddField={(field) => {
              updateModel(selectedModel.model_id, (m) => ({
                ...m,
                fields: [...(m.fields ?? []), field],
              }));
            }}
            onRemoveField={(field_id) => {
              updateModel(selectedModel.model_id, (m) => ({
                ...m,
                fields: (m.fields ?? []).filter((f: any) => f.field_id !== field_id),
              }));
            }}
            nextFieldId={nextFieldId}
            Panel={Panel}
            Button={Button}
            Input={Input}
            Textarea={Textarea}
            Select={Select}
            statusOptions={statusOptions}
            fieldStatusOptions={fieldStatusOptions}
            standardCustomOptions={standardCustomOptions}
            fieldTypeOptions={fieldTypeOptions as any}
          />
        ) : (
          <div style={{ fontSize: 13, color: "#6b7280" }}>Select a model from the library.</div>
        )
      ) : view === "field" ? (
        selectedModel && selectedField ? (
          <DataFieldDetail
            model={selectedModel}
            field={selectedField}
            onBackToModel={() => setView("model")}
            onDeleteField={() => {
              const ok = window.confirm(`Delete field ${selectedField.field_id}?`);
              if (!ok) return;
              updateModel(selectedModel.model_id, (m) => ({
                ...m,
                fields: (m.fields ?? []).filter((f: any) => f.field_id !== selectedField.field_id),
              }));
              setView("model");
            }}
            usedInTransactions={getFieldUsage(selectedModel.model_id, selectedField.field_id)}
            Panel={Panel}
            Button={Button}
          />
        ) : (
          <div style={{ fontSize: 13, color: "#6b7280" }}>Select a field from the model.</div>
        )
      ) : null}

      {/* ===================== CREATE MODEL MODAL (GLOBAL) ===================== */}
      {createOpen ? (
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>New Data Model</div>
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Close
              </Button>
            </div>

            <div style={{ height: 12 }} />

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System</div>
                  <Select
                    value={createDraft.system}
                    onChange={(v) => setCreateDraft((d) => ({ ...d, system: v }))}
                    options={[{ value: "", label: "Select system..." }, ...architectureSystemOptions]}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Entity</div>
                  <Input value={createDraft.entity} onChange={(v) => setCreateDraft((d) => ({ ...d, entity: v }))} placeholder="e.g., Position" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Version</div>
                  <Input value={createDraft.version} onChange={(v) => setCreateDraft((d) => ({ ...d, version: v }))} placeholder="1.0" />
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Status</div>
                  <Select value={createDraft.status} onChange={(v) => setCreateDraft((d) => ({ ...d, status: v as any }))} options={statusOptions} />
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Internal ID</div>
                  <div style={{ fontFamily: "monospace", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 12, background: "#f9fafb" }}>
                    {createDraft.system.trim() && createDraft.entity.trim() ? makeModelId(createDraft.system, createDraft.entity) : "(auto)"}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description (optional)</div>
                <Textarea value={createDraft.description} onChange={(v) => setCreateDraft((d) => ({ ...d, description: v }))} placeholder="What does this entity represent?" />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createModelFromModal} disabled={!createDraft.system.trim() || !createDraft.entity.trim()}>
                  Create model
                </Button>
              </div>

              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                Display uses “System &gt; Entity”. Internal IDs are stored as “System.Entity”.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}