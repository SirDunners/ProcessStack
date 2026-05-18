import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function IntegrationSystemsPanel({ integration }: any) {
  const { data, setData, Panel, Button, Select } = useProcessStackState();

  const systemOptions =
    (data.systems ?? []).map((s: any) => ({
      value: s.id,
      label: s.name,
    })) ?? [];

  const updateField = (field: "source_system" | "target_system", value: string) => {
    setData((d: any) => ({
      ...d,
      integrations: (d.integrations ?? []).map((i: any) =>
        i.id === integration.id ? { ...i, [field]: value } : i
      ),
    }));
  };

  return (
    <Panel title="Systems">
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Source System</div>
          <Select
            value={integration.source_system}
            onChange={(v) => updateField("source_system", v)}
            options={[{ value: "", label: "None" }, ...systemOptions]}
          />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Target System</div>
          <Select
            value={integration.target_system}
            onChange={(v) => updateField("target_system", v)}
            options={[{ value: "", label: "None" }, ...systemOptions]}
          />
        </div>
      </div>
    </Panel>
  );
}
