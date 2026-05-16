
import React, { useMemo, useState } from "react";

/**
 * DataModelsList (Module)
 * - Data Models catalogue / overview table
 * - Matches the "snazzy" list styling (header + one-liner + actions + hover rows)
 */

export type DataModelsListProps = {
  models: any[];
  architectureSystemOptions: { value: string; label: string }[];

  search: string;
  setSearch: (v: string) => void;

  systemFilter: string;
  setSystemFilter: (v: string) => void;

  onCreateModel: () => void;
  onOpenModel: (model_id: string) => void;

  // UI primitives from ProcessStackMVP
  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  Input: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Select: React.ComponentType<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }>;
};

export default function DataModelsList(props: DataModelsListProps) {
  const {
    models,
    architectureSystemOptions,
    search,
    setSearch,
    systemFilter,
    setSystemFilter,
    onCreateModel,
    onOpenModel,
    Panel,
    Button,
    Input,
    Select,
  } = props;

  const [hoveredModelId, setHoveredModelId] = useState<string>("");

  const filtered = useMemo(() => {
    const q = (search ?? "").trim().toLowerCase();
    return (models ?? [])
      .filter((m: any) => (!systemFilter ? true : String(m.system ?? "") === systemFilter))
      .filter((m: any) => {
        if (!q) return true;
        const hay = `${m.system} ${m.entity} ${m.model_id} ${m.status} ${m.description ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a: any, b: any) => {
        const s = String(a.system ?? "").localeCompare(String(b.system ?? ""));
        if (s !== 0) return s;
        return String(a.entity ?? "").localeCompare(String(b.entity ?? ""));
      });
  }, [models, search, systemFilter]);

  return (
    <Panel title="Data Models">
      <div style={{ display: "grid", gap: 12 }}>
        {/* Header description */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Canonical entity models (System &gt; Entity) and their field definitions.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <Button variant="secondary" onClick={onCreateModel}>
            + New Model
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 10 }}>
          <Input value={search} onChange={setSearch} placeholder="Search models..." />
          <Select
            value={systemFilter}
            onChange={setSystemFilter}
            options={[{ value: "", label: "All systems" }, ...architectureSystemOptions]}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ fontSize: 12, color: "#6b7280" }}>No data models yet. Click “+ New Model”.</div>
        ) : (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", overflowX: "auto" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "240px 240px 240px 140px 100px",
                padding: 10,
                fontWeight: 600,
                fontSize: 14,
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                minWidth: 920,
              }}
            >
              <div>System</div>
              <div>Entity</div>
              <div>Internal ID</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Fields</div>
            </div>

            {/* Rows */}
            {filtered.map((m: any) => (
              <button
                key={m.model_id}
                type="button"
                onClick={() => onOpenModel(m.model_id)}
                onMouseEnter={() => setHoveredModelId(m.model_id)}
                onMouseLeave={() => setHoveredModelId("")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "white",
                  padding: 0,
                  cursor: "pointer",
                }}
                title={`Open ${m.model_id}`}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "240px 240px 240px 140px 100px",
                    padding: 10,
                    borderBottom: "1px solid #f3f4f6",
                    alignItems: "center",
                    minWidth: 920,
                    fontSize: 14,
                    fontWeight: 400,
                    background: hoveredModelId === m.model_id ? "#f3f4f6" : "white",
                  }}
                >
                  <div>{m.system}</div>
                  <div>{m.entity}</div>
                  <div style={{ fontFamily: "monospace", color: "#6b7280" }}>{m.model_id}</div>
                  <div>{m.status}</div>
                  <div style={{ textAlign: "right" }}>{(m.fields ?? []).length}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
