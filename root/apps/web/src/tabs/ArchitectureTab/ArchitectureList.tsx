import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function ArchitectureList() {
  const {
    data,
    setData,
    Panel,
    Button,
    Input,
    Select,
    setSelectedArchitectureId,
  } = useProcessStackState();

  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const list = data.architecture ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((a: any) =>
      `${a.name} ${a.id} ${a.type} ${a.description}`.toLowerCase().includes(q)
    );
  }, [data.architecture, search]);

  const addArchitecture = () => {
    const id = `ARCH-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      architecture: [
        ...(d.architecture ?? []),
        {
          id,
          name: "New Architecture Component",
          type: "system",
          description: "",
          systems: [],
          integrations: [],
        },
      ],
    }));
    setSelectedArchitectureId(id);
  };

  return (
    <Panel title="Architecture">
      <div style={{ display: "grid", gap: 12 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search architecture..."
        />

        <Button onClick={addArchitecture}>+ Add Architecture Component</Button>

        {items.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No architecture components found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((a: any) => (
              <div
                key={a.id}
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
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {a.type} • {a.id}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedArchitectureId(a.id)}
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
