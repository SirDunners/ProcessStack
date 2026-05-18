import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function DataModelFieldsPanel({ model }: any) {
  const { setData, Panel, Button, Input } = useProcessStackState();

  const [newField, setNewField] = useState({
    field_id: "",
    label: "",
    type: "string",
    required: false,
    allowedValues: "",
    source_field_code: "",
  });

  const addField = () => {
    if (!newField.field_id.trim()) return;

    setData((d: any) => ({
      ...d,
      data_models: (d.data_models ?? []).map((m: any) =>
        m.id === model.id
          ? {
              ...m,
              fields: [...(m.fields ?? []), { ...newField }],
            }
          : m
      ),
    }));

    setNewField({
      field_id: "",
      label: "",
      type: "string",
      required: false,
      allowedValues: "",
      source_field_code: "",
    });
  };

  const removeField = (fid: string) => {
    setData((d: any) => ({
      ...d,
      data_models: (d.data_models ?? []).map((m: any) =>
        m.id === model.id
          ? {
              ...m,
              fields: (m.fields ?? []).filter((f: any) => f.field_id !== fid),
            }
          : m
      ),
    }));
  };

  return (
    <Panel title="Fields">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 700 }}>Add field</div>

        <Input
          value={newField.field_id}
          onChange={(v) => setNewField((d) => ({ ...d, field_id: v }))}
          placeholder="Field ID"
        />

        <Input
          value={newField.label}
          onChange={(v) => setNewField((d) => ({ ...d, label: v }))}
          placeholder="Label"
        />

        <select
          value={newField.type}
          onChange={(e) =>
            setNewField((d) => ({ ...d, type: e.target.value }))
          }
          style={{ padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
        >
          {["string", "number", "boolean", "date", "enum", "object"].map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>

        <Input
          value={newField.allowedValues}
          onChange={(v) => setNewField((d) => ({ ...d, allowedValues: v }))}
          placeholder="Allowed values (comma)"
        />

        <Input
          value={newField.source_field_code}
          onChange={(v) =>
            setNewField((d) => ({ ...d, source_field_code: v }))
          }
          placeholder="Source field code"
        />

        <Button onClick={addField}>+ Add field</Button>

        <div style={{ height: 12 }} />

        {(model.fields ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No fields yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {(model.fields ?? []).map((f: any) => (
              <div
                key={f.field_id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "white",
                }}
              >
                <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                  {f.field_id}
                </div>
                <div>{f.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {f.type} {f.required ? "(required)" : ""}
                </div>
                <Button variant="ghost" onClick={() => removeField(f.field_id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
