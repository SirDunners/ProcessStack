import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function DataModelList() {
  const {
    data,
    setData,
    Panel,
    Button,
    Input,
    Select,
    setSelectedDataModelId,
  } = useProcessStackState();

  const [search, setSearch] = useState("");

  const models = useMemo(() => {
    const list = data.data_models ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((m: any) =>
      `${m.name} ${m.id} ${m.description}`.toLowerCase().includes(q)
    );
  }, [data.data_models, search]);

  const addModel = () => {
    const id = `DM-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      data_models: [
        ...(d.data_models ?? []),
        {
          id,
          name: "New Data Model",
          description: "",
          system: "",
          fields: [],
        },
      ],
    }));
    setSelectedDataModelId(id);
  };

  return (
    <Panel title="Data Models">
      <div style={{ display: "grid", gap: 12 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search data models..."
        />

        <Button onClick={addModel}>+ Add Data Model</Button>

        {models.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No data models found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {models.map((m: any) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{m.id}</div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedDataModelId(m.id)}
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
