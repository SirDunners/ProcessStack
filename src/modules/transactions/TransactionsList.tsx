import React, { useMemo, useState } from "react";

// ================================================
// START - Type Definitions
// ================================================
type SortKey = "name" | "system" | "l2" | "l3" | "l4" | "status" | "steps" | "actions" | "events";
type SortDir = "asc" | "desc";
type GroupBy = "none" | "system" | "l2" | "l3" | "l4" | "status";

type Props = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;

  personaOptions: { value: string; label: string }[];
  systemOptions: { value: string; label: string }[];

  getLinkedProcessStepsForTransaction: (trxId: string) => any[];

  // UI primitives passed from ProcessStackMVP
  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  Input: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Textarea: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Select: React.ComponentType<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }>;

  onOpenTransaction: (trxId: string) => void;
};
// ================================================
// END - Type Definitions
// ================================================

// ================================================
// START - Helper Functions
// ================================================
function makeTrxId() {
  return `TRX-${Math.random().toString(16).slice(2, 8).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;
}
// ================================================
// END - Helper Functions
// ================================================

export default function TransactionsList(props: Props) {
  const {
    data,
    setData,
    personaOptions,
    systemOptions,
    getLinkedProcessStepsForTransaction,
    Button,
    Input,
    Textarea,
    Select,
    onOpenTransaction,
  } = props;

  // ================================================
  // START - Local State
  // ================================================
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState("");
  const [filterL2, setFilterL2] = useState("");
  const [filterL3, setFilterL3] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPersonaId, setFilterPersonaId] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<{ name: string; system: string; intent: string }>({
    name: "",
    system: "",
    intent: "",
  });
  // ================================================
  // END - Local State
  // ================================================

  // ================================================
  // START - Computed Data (strong process_path)
  // ================================================
  const personaNameById = useMemo(() => {
    const m = new Map<string, string>();
    (data.personas ?? []).forEach((p: any) => m.set(p.persona_id, p.display_name));
    return m;
  }, [data.personas]);

  const rows = useMemo(() => {
    return (data.transactions ?? []).map((t: any) => {
      let l2 = "";
      let l3 = "";
      let l4 = "";

      if (t.process_path && Array.isArray(t.process_path) && t.process_path.length > 0) {
        l2 = t.process_path[0] || "";
        l3 = t.process_path[1] || "";
        l4 = t.process_path[2] || "";
      } else {
        const linked = getLinkedProcessStepsForTransaction(t.transaction_id);
        const primary = linked?.[0];
        l2 = primary?.l2?.title ?? "";
        l3 = primary?.l3?.title ?? "";
        l4 = primary?.l4?.title ?? "";
      }

      const system = (t.system_context ?? [])[0] ?? "";
      const personaIds = t.performed_by_personas ?? [];
      const personaNames = (personaIds as string[])
        .map((id) => personaNameById.get(id))
        .filter(Boolean) as string[];

      return {
        id: t.transaction_id,
        name: t.name ?? "",
        status: t.status ?? "Draft",
        system,
        l2,
        l3,
        l4,
        personaIds,
        personaNames,
        stepsCount: (t.steps ?? []).length,
        actionsCount: (t.system_actions ?? []).length,
        eventsCount: (t.emitted_events ?? []).length,
      };
    });
  }, [data.transactions, getLinkedProcessStepsForTransaction, personaNameById]);

  const l2Options = useMemo(() => {
    const vals = Array.from(new Set(rows.map((r) => r.l2).filter(Boolean))).sort();
    return vals.map((v) => ({ value: v, label: v }));
  }, [rows]);

  const l3Options = useMemo(() => {
    const vals = Array.from(
      new Set(
        rows
          .filter((r) => !filterL2 || r.l2 === filterL2)
          .map((r) => r.l3)
          .filter(Boolean)
      )
    ).sort();
    return vals.map((v) => ({ value: v, label: v }));
  }, [rows, filterL2]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let out = rows.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.system || "").toLowerCase().includes(q) ||
        (r.l2 || "").toLowerCase().includes(q) ||
        (r.l3 || "").toLowerCase().includes(q) ||
        (r.l4 || "").toLowerCase().includes(q) ||
        r.personaNames.join(" ").toLowerCase().includes(q);

      const matchesSystem = !filterSystem || r.system === filterSystem;
      const matchesL2 = !filterL2 || r.l2 === filterL2;
      const matchesL3 = !filterL3 || r.l3 === filterL3;
      const matchesStatus = !filterStatus || r.status === filterStatus;
      const matchesPersona = !filterPersonaId || (r.personaIds ?? []).includes(filterPersonaId);

      return matchesSearch && matchesSystem && matchesL2 && matchesL3 && matchesStatus && matchesPersona;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    const getKey = (r: any) => {
      switch (sortKey) {
        case "name": return r.name;
        case "system": return r.system;
        case "l2": return r.l2;
        case "l3": return r.l3;
        case "l4": return r.l4;
        case "status": return r.status;
        case "steps": return r.stepsCount;
        case "actions": return r.actionsCount;
        case "events": return r.eventsCount;
        default: return r.name;
      }
    };

    out = [...out].sort((a, b) => {
      const ka = getKey(a);
      const kb = getKey(b);
      if (typeof ka === "number" && typeof kb === "number") return (ka - kb) * dir;
      return String(ka).localeCompare(String(kb)) * dir;
    });

    return out;
  }, [rows, search, filterSystem, filterL2, filterL3, filterStatus, filterPersonaId, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;

    const keyFor = (r: any) => {
      switch (groupBy) {
        case "system": return r.system || "(No system)";
        case "l2": return r.l2 || "(Unlinked)";
        case "l3": return r.l3 || "(Unlinked)";
        case "l4": return r.l4 || "(Unlinked)";
        case "status": return r.status || "(No status)";
        default: return "";
      }
    };

    return filteredSorted.reduce((acc: Record<string, any[]>, r) => {
      const g = keyFor(r);
      acc[g] = acc[g] ?? [];
      acc[g].push(r);
      return acc;
    }, {});
  }, [filteredSorted, groupBy]);
  // ================================================
  // END - Computed Data
  // ================================================

  // ================================================
  // START - Helper Functions
  // ================================================
  function clearAll() {
    setSearch("");
    setFilterSystem("");
    setFilterL2("");
    setFilterL3("");
    setFilterStatus("");
    setFilterPersonaId("");
    setSortKey("name");
    setSortDir("asc");
    setGroupBy("none");
    setGroupCollapsed({});
  }

  function openCreate() {
    setCreateDraft({ name: "", system: "", intent: "" });
    setCreateOpen(true);
  }

  function createTransaction() {
    const name = createDraft.name.trim();
    if (!name) return;

    const newId = makeTrxId();

    const trx = {
      transaction_id: newId,
      name,
      process_path: [],
      system_context: createDraft.system ? [createDraft.system] : [],
      performed_by_personas: [],
      intent: createDraft.intent.trim(),
      version: "0.1",
      status: "Draft",
      steps: [],
      emitted_events: [],
      system_actions: [],
    };

    setData((d: any) => ({
      ...d,
      transactions: [trx, ...(d.transactions ?? [])],
    }));

    setCreateOpen(false);
    onOpenTransaction(newId);
  }

  function deleteTransaction(trxId: string) {
    if (!window.confirm(`Delete transaction "${trxId}" permanently? This cannot be undone.`)) return;

    setData((d: any) => {
      let newData = { ...d };

      newData.transactions = (d.transactions ?? []).filter((t: any) => t.transaction_id !== trxId);

      if (newData.l4_process_nodes && Array.isArray(newData.l4_process_nodes)) {
        newData.l4_process_nodes = newData.l4_process_nodes.map((node: any) => {
          if (node.transactionIds && Array.isArray(node.transactionIds)) {
            node.transactionIds = node.transactionIds.filter((id: string) => id !== trxId);
          }
          return node;
        });
      }

      return newData;
    });
  }
  // ================================================
  // END - Helper Functions
  // ================================================

  // ================================================
  // START - Sub-Components (ZenUI Table)
  // ================================================
  const TableHeader = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 160px 160px 220px 220px 90px 90px 90px 120px 70px",
        padding: "14px 20px",
        fontWeight: 700,
        fontSize: 14,
        borderBottom: "1px solid #e5e7eb",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      <div>Name</div>
      <div>System</div>
      <div>Level 2</div>
      <div>Level 3</div>
      <div>Level 4</div>
      <div>Steps</div>
      <div>Actions</div>
      <div>Events</div>
      <div>Status</div>
      <div style={{ textAlign: "center" }}>Actions</div>
    </div>
  );

  const Row = ({ r }: { r: any }) => (
    <div
      onClick={() => onOpenTransaction(r.id)}
      style={{
        display: "grid",
        gridTemplateColumns: "280px 160px 160px 220px 220px 90px 90px 90px 120px 70px",
        padding: "14px 20px",
        borderBottom: "1px solid #f1f5f9",
        cursor: "pointer",
        background: "white",
        alignItems: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
    >
      <div style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>{r.name}</div>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{r.system || "-"}</div>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{r.l2 || "-"}</div>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{r.l3 || "-"}</div>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{r.l4 || "-"}</div>
      <div style={{ fontFamily: "monospace", fontSize: 14 }}>{r.stepsCount}</div>
      <div style={{ fontFamily: "monospace", fontSize: 14 }}>{r.actionsCount}</div>
      <div style={{ fontFamily: "monospace", fontSize: 14 }}>{r.eventsCount}</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: r.status === "Active" ? "#10b981" : r.status === "Draft" ? "#64748b" : "#f59e0b",
        }}
      >
        {r.status}
      </div>
      <div style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          onClick={() => deleteTransaction(r.id)}
          style={{ color: "#ef4444", padding: "4px 8px", fontSize: 13 }}
        >
          🗑
        </Button>
      </div>
    </div>
  );
  // ================================================
  // END - Sub-Components (ZenUI Table)
  // ================================================

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* ZenUI Toolbar + Filters + New Transaction */}
      <div style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "end",
        justifyContent: "space-between",
        background: "white",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #e5e7eb"
      }}>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>Search</div>
            <Input value={search} onChange={setSearch} placeholder="Search transactions..." />
          </div>

          <div style={{ width: 180 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>System</div>
            <Select value={filterSystem} onChange={setFilterSystem} options={[{ value: "", label: "All systems" }, ...systemOptions]} />
          </div>

          <div style={{ width: 160 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>L2</div>
            <Select value={filterL2} onChange={(v) => { setFilterL2(v); setFilterL3(""); }} options={[{ value: "", label: "All L2" }, ...l2Options]} />
          </div>

          <div style={{ width: 180 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>L3</div>
            <Select value={filterL3} onChange={setFilterL3} options={[{ value: "", label: "All L3" }, ...l3Options]} />
          </div>

          <div style={{ width: 180 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>Persona</div>
            <Select value={filterPersonaId} onChange={setFilterPersonaId} options={[{ value: "", label: "All personas" }, ...personaOptions]} />
          </div>

          <div style={{ width: 150 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>Status</div>
            <Select value={filterStatus} onChange={setFilterStatus} options={[{ value: "", label: "All statuses" }, { value: "Draft", label: "Draft" }, { value: "Active", label: "Active" }, { value: "Deprecated", label: "Deprecated" }]} />
          </div>

          <div style={{ width: 170 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>Sort</div>
            <Select value={`${sortKey}:${sortDir}`} onChange={(v) => { const [k, d] = v.split(":"); setSortKey(k as SortKey); setSortDir(d as SortDir); }} options={[ { value: "name:asc", label: "Name (A→Z)" }, { value: "name:desc", label: "Name (Z→A)" }, { value: "system:asc", label: "System (A→Z)" }, { value: "l2:asc", label: "L2 (A→Z)" }, { value: "l3:asc", label: "L3 (A→Z)" }, { value: "status:asc", label: "Status (A→Z)" }, { value: "steps:desc", label: "Steps (high→low)" }, { value: "actions:desc", label: "Actions (high→low)" }, { value: "events:desc", label: "Events (high→low)" } ]} />
          </div>

          <div style={{ width: 160 }}>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 5, fontWeight: 500 }}>Group by</div>
            <Select value={groupBy} onChange={(v) => setGroupBy(v as GroupBy)} options={[ { value: "none", label: "None" }, { value: "system", label: "System" }, { value: "l2", label: "L2" }, { value: "l3", label: "L3" }, { value: "l4", label: "L4 step" }, { value: "status", label: "Status" } ]} />
          </div>

          <Button variant="ghost" onClick={clearAll}>Clear</Button>
        </div>

        <Button 
          variant="secondary" 
          onClick={openCreate}
          style={{ background: "#111827", color: "white", padding: "11px 24px", borderRadius: 12, fontWeight: 600, boxShadow: "0 2px 6px rgba(17,24,39,0.15)" }}
        >
          + New Transaction
        </Button>
      </div>

      {/* ZenUI Create Modal */}
      {createOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 20000 }}>
          <div style={{ width: "min(720px, 96vw)", background: "white", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>New Transaction</div>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>✕</Button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Transaction name</div>
                <Input value={createDraft.name} onChange={(v) => setCreateDraft((d) => ({ ...d, name: v }))} placeholder="e.g. Approve Leave Request" />
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>System</div>
                <Select value={createDraft.system} onChange={(v) => setCreateDraft((d) => ({ ...d, system: v }))} options={[{ value: "", label: "Select system..." }, ...systemOptions]} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Intent (optional)</div>
                <Textarea value={createDraft.intent} onChange={(v) => setCreateDraft((d) => ({ ...d, intent: v }))} placeholder="What does this transaction achieve?" />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createTransaction} disabled={!createDraft.name?.trim()}>Create Transaction</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Table */}
      {filteredSorted.length === 0 ? (
        <div style={{ color: "#6b7280", padding: 40, textAlign: "center", fontSize: 15 }}>
          No transactions match your filters.
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "white" }}>
          <TableHeader />

          {groupBy === "none" ? (
            filteredSorted.map((r) => <Row key={r.id} r={r} />)
          ) : (
            Object.entries(grouped ?? {}).map(([g, items]) => {
              const collapsed = !!groupCollapsed[g];
              return (
                <div key={g}>
                  <div
                    onClick={() => setGroupCollapsed((m) => ({ ...m, [g]: !m[g] }))}
                    style={{
                      padding: "12px 20px",
                      background: "#f9fafb",
                      borderTop: "1px solid #e5e7eb",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {g} <span style={{ fontWeight: 400, color: "#6b7280" }}>({items.length})</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      {collapsed ? "Expand" : "Collapse"}
                    </div>
                  </div>

                  {!collapsed ? (items as any[]).map((r) => <Row key={r.id} r={r} />) : null}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}