import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function IntegrationDataModelsPanel({ integration }: any) {
  const { data, setData, Panel, Button, Select } = useProcessStackState();

  const modelOptions =
    (data.data_models ?? []).map((m: any) => ({
      value: m.id,
      label: m.name,
    })) ?? [];

  const addModel = (id: string) => {
    if (!id) return;
    setData((d: any) => ({
      ...d,
      integrations: (d.integrations ?? []).map((i: any) =>
        i.id === integration.id
          ? {
              ...i,
              dataModels: Array.from(new Set([...(i.dataModels ?? []), id])),
            }
          : i
      ),
    }));
  };

  const removeModel = (id: string) => {
    setData((d: any) => ({
      ...d,
      integrations: (d.integrations ?? []).map((i: any) =>
        i.id === integration.id
          ? {
              ...i,
              dataModels: (i.dataModels ?? []).filter((x: string) => x !== id),
            }
          : i
      ),
    }));
  };

  return (
    <Panel title="Data Models">
      <div style={{ display: "grid", gap: 12 }}>
        <Select
          value=""
          onChange={addModel}
          options={[{ value: "", label: "Add data model..." }, ...modelOptions]}
        />

        {(integration.dataModels ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No data models linked.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {(integration.dataModels ?? []).map((mid: string) => {
              const model = (data.data_models ?? []).find((m: any) => m.id === mid);
              return (
                <div
                  key={mid}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>{model?.name ?? mid}</div>
                  <Button variant="ghost" onClick={() => removeModel(mid)}>
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
