import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonaList() {
  const {
    data,
    setData,
    Panel,
    Button,
    Input,
    setSelectedPersonaId,
  } = useProcessStackState();

  const [search, setSearch] = useState("");

  const personas = useMemo(() => {
    const list = data.personas ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p: any) =>
      `${p.display_name} ${p.persona_id} ${p.description}`
        .toLowerCase()
        .includes(q)
    );
  }, [data.personas, search]);

  const addPersona = () => {
    const id = `PER-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      personas: [
        ...(d.personas ?? []),
        {
          persona_id: id,
          display_name: "New Persona",
          description: "",
          avatar: "",
          responsibilities: "",
          systems: [],
        },
      ],
    }));
    setSelectedPersonaId(id);
  };

  return (
    <Panel title="Personas">
      <div style={{ display: "grid", gap: 12 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search personas..."
        />

        <Button onClick={addPersona}>+ Add Persona</Button>

        {personas.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No personas found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {personas.map((p: any) => (
              <div
                key={p.persona_id}
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
                  <div style={{ fontWeight: 700 }}>{p.display_name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {p.persona_id}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedPersonaId(p.persona_id)}
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
