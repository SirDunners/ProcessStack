import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function ArchitectureIntegrationsPanel({ item }: any) {
  const { data, setData, Panel, Button, Select } = useProcessStackState();

  const integrationOptions =
    (data.integrations ?? []).map((i: any) => ({
      value: i.id,
      label: i.name,
    })) ?? [];

  const addIntegration = (id: string) => {
    if (!id) return;
    setData((d: any) => ({
      ...d,
      architecture: (d.architecture ?? []).map((a: any) =>
        a.id === item.id
          ? {
              ...a,
              integrations: Array.from(new Set([...(a.integrations ?? []), id])),
            }
          : a
      ),
    }));
  };

  const removeIntegration = (id: string) => {
    setData((d: any) => ({
      ...d,
      architecture: (d.architecture ?? []).map((a: any) =>
        a.id === item.id
          ? {
              ...a,
              integrations: (a.integrations ?? []).filter((x: string) => x !== id),
            }
          : a
      ),
    }));
  };

  return (
    <Panel title="Integrations">
      <div style={{ display: "grid", gap: 12 }}>
        <Select
          value=""
          onChange={addIntegration}
          options={[{ value: "", label: "Add integration..." }, ...integrationOptions]}
        />

        {(item.integrations ?? []).length === 0 ? (
          <div style={{ color: "#6b7280" }}>No integrations linked.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {(item.integrations ?? []).map((iid: string) => {
              const integ = (data.integrations ?? []).find((i: any) => i.id === iid);
              return (
                <div
                  key={iid}
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
                  <div>{integ?.name ?? iid}</div>
                  <Button variant="ghost" onClick={() => removeIntegration(iid)}>
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
