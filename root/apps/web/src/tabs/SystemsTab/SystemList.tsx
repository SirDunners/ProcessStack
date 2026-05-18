import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function SystemList() {
  const {
    data,
    setData,
    Panel,
    Button,
    Input,
    Select,
    setSelectedSystemId,
  } = useProcessStackState();

  const [search, setSearch] = useState("");

  const systems = useMemo(() => {
    const list = data.systems ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((s: any) =>
      `${s.name} ${s.id} ${s.description}`.toLowerCase().includes(q)
    );
  }, [data.systems, search]);

  const addSystem = () => {
    const id = `SYS-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      systems: [
        ...(d.systems ?? []),
        {
          id,
          name: "New System",
          category: "",
          description: "",
          modules: [],
        },
      ],
    }));
    setSelectedSystemId(id);
  };

  return (
    <Panel title="Systems">
      <div style={{ display: "grid", gap: 12 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search systems..."
        />

        <Button onClick={addSystem}>+ Add System</Button>

        {systems.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No systems found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {systems.map((s: any) => (
              <div
                key={s.id}
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
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{s.id}</div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedSystemId(s.id)}
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
