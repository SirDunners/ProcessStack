import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function IntegrationBasicsPanel({ integration }: any) {
  const { setData, Panel, Input, Textarea, Select } = useProcessStackState();

  const [draft, setDraft] = useState({
    name: integration.name ?? "",
    type: integration.type ?? "api",
    description: integration.description ?? "",
  });

  const save = () => {
    setData((d: any) => ({
      ...d,
      integrations: (d.integrations ?? []).map((i: any) =>
        i.id === integration.id
          ? {
              ...i,
              name: draft.name.trim(),
              type: draft.type,
              description: draft.description.trim(),
            }
          : i
      ),
    }));
  };

  return (
    <Panel title="Basics">
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Name</div>
          <Input
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Type</div>
          <Select
            value={draft.type}
            onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
            options={[
              { value: "api", label: "API" },
              { value: "event", label: "Event" },
              { value: "file", label: "File Transfer" },
              { value: "webhook", label: "Webhook" },
              { value: "orchestration", label: "Orchestration" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Description</div>
          <Textarea
            value={draft.description}
            onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
          />
        </div>

        <button onClick={save}>Save</button>
      </div>
    </Panel>
  );
}
