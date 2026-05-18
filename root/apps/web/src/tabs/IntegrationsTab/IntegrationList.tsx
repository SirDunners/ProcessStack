import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function IntegrationList() {
  const {
    data,
    setData,
    Panel,
    Button,
    Input,
    Select,
    setSelectedIntegrationId,
  } = useProcessStackState();

  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("");

  const systems = data.systems ?? [];

  const integrations = useMemo(() => {
    let list = data.integrations ?? [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i: any) =>
        `${i.name} ${i.id} ${i.description}`.toLowerCase().includes(q)
      );
    }

    if (filterSystem) {
      list = list.filter(
        (i: any) =>
          i.source_system === filterSystem ||
          i.target_system === filterSystem
      );
    }

    return list;
  }, [data.integrations, search, filterSystem]);

  const addIntegration = () => {
    const id = `INT-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      integrations: [
        ...(d.integrations ?? []),
        {
          id,
          name: "New Integration",
          type: "api",
          description: "",
          source_system: "",
          target_system: "",
          dataModels: [],
          events: [],
        },
      ],
    }));
    setSelectedIntegrationId(id);
  };

  return (
    <Panel title="Integrations">
      <div style={{ display: "grid", gap: 12 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search integrations..."
        />

        <Select
          value={filterSystem}
          onChange={setFilterSystem}
          options={[
            { value: "", label: "Filter by system" },
            ...systems.map((s: any) => ({ value: s.id, label: s.name })),
          ]}
        />

        <Button onClick={addIntegration}>+ Add Integration</Button>

        {integrations.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No integrations found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {integrations.map((i: any) => (
              <div
                key={i.id}
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
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {i.type} • {i.id}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedIntegrationId(i.id)}
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
