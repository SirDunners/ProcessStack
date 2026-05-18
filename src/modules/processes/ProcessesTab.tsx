import React, { useMemo, useState, useEffect } from "react";

// ProcessesTab (Module)
// - L2 -> L4 navigation
// - L5 transaction linking (existing)
// - Phase 2A (Step 1): Create new transaction + link to selected L4 step

// ================================================
// START - Type Definitions
// ================================================
export type ProcessesTabProps = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  deepLinkL4Id?: string;
  clearDeepLinkL4Id?: () => void;

  // Needed for deep-linking from Processes -> Transactions
  setTab: (tab: any) => void;
  setSelectedTransactionId: (id: string) => void;
  setTransactionsInitialView: (v: "list" | "detail") => void;

  // UI primitives from ProcessStackMVP
  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  Select: React.ComponentType<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }>;
  Input: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Textarea: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;

  ProcessesL2Accordion: React.ComponentType<{ areas: any[]; onOpen: (area: any) => void }>;
};

type ProcessLevel = 2 | 3 | 4 | 5;

type ProcessNode = {
  id: string;
  level: ProcessLevel;
  parentId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  transactionIds?: string[];
};

type Transaction = {
  transaction_id: string;
  name: string;
  process_path: string[];
  system_context: string[];
  performed_by_personas: string[];
  intent: string;
  version: string;
  status: "Draft" | "Active" | "Deprecated";
  steps: any[];
  emitted_events: any[];
  system_actions: any[];
};
// ================================================
// END - Type Definitions
// ================================================

// ================================================
// START - Static Data
// ================================================
const L2_PROCESS_AREAS = [
  {
    id: "L2-HR",
    title: "Human Resources",
    description: "Recruitment, onboarding, position management, and workforce changes.",
    imageUrl: "https://images.unsplash.com/photo-1644132246573-bc75ce0a2946?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-FIN",
    title: "Finance",
    description: "Procure-to-pay, record-to-report, invoicing, approvals, and controls.",
    imageUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-IT",
    title: "IT & Access",
    description: "Joiners/movers/leavers, identity, permissions, and device provisioning.",
    imageUrl: "https://images.unsplash.com/photo-1683322499436-f4383dd59f5a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-OPS",
    title: "Operations",
    description: "Service delivery, case handling, and operational workflows.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1721936482448-1400b30b3c00?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

const L3_PROCESS_NODES: ProcessNode[] = [
  { id: "L3-HR-REC", level: 3, parentId: "L2-HR", title: "Recruitment", description: "Candidate attraction, requisitions, selection, offers and hiring workflow." },
  { id: "L3-HR-ONB", level: 3, parentId: "L2-HR", title: "Onboarding", description: "Pre-start checks, provisioning, day-one readiness and induction steps." },
  { id: "L3-HR-POS", level: 3, parentId: "L2-HR", title: "Position Management", description: "Create/change positions, approvals, org structures and effective dating." },

  { id: "L3-FIN-P2P", level: 3, parentId: "L2-FIN", title: "Procure to Pay", description: "Requisitions, purchase orders, invoices, approvals and payment runs." },
  { id: "L3-FIN-R2R", level: 3, parentId: "L2-FIN", title: "Record to Report", description: "Close, journals, reporting and controls across finance systems." },

  { id: "L3-IT-JML", level: 3, parentId: "L2-IT", title: "Joiners / Movers / Leavers", description: "Account creation, access changes, deprovisioning and auditability." },
  { id: "L3-IT-IGA", level: 3, parentId: "L2-IT", title: "Identity & Governance", description: "Roles, groups, access policies, periodic reviews and approvals." },

  { id: "L3-OPS-CASE", level: 3, parentId: "L2-OPS", title: "Case Handling", description: "Intake, routing, resolution, SLAs and exception handling." },
  { id: "L3-OPS-SVC", level: 3, parentId: "L2-OPS", title: "Service Delivery", description: "BAU delivery workflows, handoffs, performance and escalation paths." },
];

const DEFAULT_L4_PROCESS_NODES: ProcessNode[] = [
  { id: "L4-HR-REC-REQ", level: 4, parentId: "L3-HR-REC", title: "Create Requisition", description: "Create a new requisition and capture role requirements and approvals path." },
  { id: "L4-HR-REC-APR", level: 4, parentId: "L3-HR-REC", title: "Approve Requisition", description: "Route approval to budget/HR/business stakeholders and record outcomes." },
  { id: "L4-HR-REC-POST", level: 4, parentId: "L3-HR-REC", title: "Post Requisition", description: "Publish the role to internal/external channels and confirm visibility." },

  { id: "L4-HR-ONB-PRE", level: 4, parentId: "L3-HR-ONB", title: "Pre-start Checks", description: "Right-to-work checks, background checks, contract completion and verification." },
  { id: "L4-HR-ONB-ACC", level: 4, parentId: "L3-HR-ONB", title: "Provision Accounts", description: "Trigger joiner tasks for identity, email, tools, and access allocation." },
  { id: "L4-HR-ONB-DAY", level: 4, parentId: "L3-HR-ONB", title: "Day-One Readiness", description: "Confirm equipment, access, welcome comms and induction schedule are ready." },

  // Legacy "Create Position" entry — removed the old transactionIds so it no longer shows the rogue transaction
  { id: "L4-HR-POS-CRT", level: 4, parentId: "L3-HR-POS", title: "Create Position", description: "Create a new position under an org structure with effective dating." },
  { id: "L4-HR-POS-CHG", level: 4, parentId: "L3-HR-POS", title: "Change Position", description: "Change job attributes, department, cost centre or reporting relationships." },
];
// ================================================
// END - Static Data
// ================================================

export default function ProcessesTab(props: ProcessesTabProps) {
  const { data, setData, setTab, setSelectedTransactionId, setTransactionsInitialView, deepLinkL4Id, clearDeepLinkL4Id, Panel, Button, Select, Input, Textarea, ProcessesL2Accordion } = props;

  // ================================================
  // START - Local State
  // ================================================
  const [processesView, setProcessesView] = useState<"l2" | "l2Detail" | "l3Detail">("l2");
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null);
  const [selectedL3Id, setSelectedL3Id] = useState<string | null>(null);
  const [selectedL4Id, setSelectedL4Id] = useState<string | null>(null);
  const [l3ViewMode, setL3ViewMode] = useState<"cards" | "table">("cards");

  const [linkTrxToL4Id, setLinkTrxToL4Id] = useState<string>("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<{ name: string; system: string; personaId: string; intent: string }>({
    name: "",
    system: "",
    personaId: "",
    intent: "",
  });
  // ================================================
  // END - Local State
  // ================================================

  // ================================================
  // START - Data Initialization
  // ================================================
  useEffect(() => {
    if (Array.isArray((data as any)?.l4_process_nodes)) return;
    setData((d: any) => ({ ...d, l4_process_nodes: DEFAULT_L4_PROCESS_NODES }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ================================================
  // END - Data Initialization
  // ================================================

  // ================================================
  // START - Computed Data
  // ================================================
  const l4All: ProcessNode[] = useMemo(() => ((data as any)?.l4_process_nodes ?? DEFAULT_L4_PROCESS_NODES) as ProcessNode[], [data]);

  const personaOptions = useMemo(() => {
    return (data.personas ?? []).map((p: any) => ({ value: p.persona_id, label: p.display_name }));
  }, [data.personas]);

  const systemOptions = useMemo(() => {
    return (data.systems ?? []).map((s: any) => ({ value: s.name, label: s.name }));
  }, [data.systems]);

  const personaNameById = useMemo(() => {
    const m = new Map<string, string>();
    (data.personas ?? []).forEach((p: any) => m.set(p.persona_id, p.display_name));
    return m;
  }, [data.personas]);

  const trxOptions = useMemo(() => {
    return (data.transactions ?? []).map((t: any) => ({ value: t.transaction_id, label: t.name }));
  }, [data.transactions]);

  const l3Nodes = useMemo(() => L3_PROCESS_NODES.filter((n) => n.level === 3 && n.parentId === selectedL2Id), [selectedL2Id]);

  const l4Nodes = useMemo(() => (selectedL3Id ? l4All.filter((n) => n.level === 4 && n.parentId === selectedL3Id) : []), [l4All, selectedL3Id]);

  const selectedL4 = useMemo(() => (selectedL4Id ? l4All.find((x) => x.id === selectedL4Id) : undefined), [l4All, selectedL4Id]);

  const linkedTransactions = useMemo(() => {
    const trxIds = selectedL4?.transactionIds ?? [];
    const tx = (data.transactions ?? []) as Transaction[];
    return tx.filter((t) => trxIds.includes(t.transaction_id));
  }, [data.transactions, selectedL4]);
  // ================================================
  // END - Computed Data
  // ================================================

  // ================================================
  // START - useEffect Hooks
  // ================================================
  useEffect(() => {
    if (!deepLinkL4Id) return;
  
    const l4 = l4All.find((n) => n.id === deepLinkL4Id);
    if (!l4) return;
  
    const l3 = L3_PROCESS_NODES.find((n) => n.id === l4.parentId);
    const l2Id = l3?.parentId ?? null;
  
    setSelectedL2Id(l2Id);
    setSelectedL3Id(l3?.id ?? null);
    setSelectedL4Id(l4.id);
    setProcessesView("l3Detail");
  
    clearDeepLinkL4Id?.();
  }, [deepLinkL4Id, l4All, clearDeepLinkL4Id]);
  // ================================================
  // END - useEffect Hooks
  // ================================================

  // ================================================
  // START - Helper Functions
  // ================================================
  function personaSuffixForTransaction(trx: any) {
    const ids: string[] = trx?.performed_by_personas ?? [];
    if (ids.length === 1) {
      const name = personaNameById.get(ids[0]) || ids[0];
      return ` (${name})`;
    }
    if (ids.length > 1) return " (Multiple)";
    return "";
  }

  function linkTransactionToSelectedL4(trxId: string) {
    if (!selectedL4Id) return;
    const cleanId = (trxId || "").trim();
    if (!cleanId) return;

    setData((d: any) => {
      const nodes: ProcessNode[] = (d.l4_process_nodes ?? DEFAULT_L4_PROCESS_NODES) as ProcessNode[];
      const l4 = nodes.find((n) => n.id === selectedL4Id);
      if (!l4) return d;

      const l3 = L3_PROCESS_NODES.find((n) => n.id === l4.parentId);
      const l2 = L2_PROCESS_AREAS.find((area) => area.id === l3?.parentId);

      const processPath = [l2?.title || "", l3?.title || "", l4.title || ""].filter(Boolean);

      const updatedTransactions = (d.transactions ?? []).map((t: any) => {
        if (t.transaction_id === cleanId) return { ...t, process_path: processPath };
        return t;
      });

      const nextNodes = nodes.map((n) => {
        if (n.id !== selectedL4Id) return n;
        const existing = n.transactionIds ?? [];
        if (existing.includes(cleanId)) return n;
        return { ...n, transactionIds: [...existing, cleanId] };
      });

      return { ...d, transactions: updatedTransactions, l4_process_nodes: nextNodes };
    });

    setLinkTrxToL4Id("");
  }

  function unlinkTransactionFromSelectedL4(trxId: string) {
    if (!selectedL4Id) return;
    const cleanId = (trxId || "").trim();
    if (!cleanId) return;

    setData((d: any) => {
      const nodes: ProcessNode[] = (d.l4_process_nodes ?? DEFAULT_L4_PROCESS_NODES) as ProcessNode[];
      const next = nodes.map((n) => {
        if (n.id !== selectedL4Id) return n;
        const existing = n.transactionIds ?? [];
        return { ...n, transactionIds: existing.filter((x) => x !== cleanId) };
      });
      return { ...d, l4_process_nodes: next };
    });
  }

  function openCreateAndLink() {
    if (!selectedL4Id) return;
    setCreateDraft({ name: "", system: "", personaId: "", intent: "" });
    setCreateOpen(true);
  }

  function createAndLinkTransaction() {
    if (!selectedL4Id) return;
    const name = createDraft.name.trim();
    if (!name) return;

    const newId = makeTrxId();

    const l4 = (data.l4_process_nodes ?? DEFAULT_L4_PROCESS_NODES).find((n: any) => n.id === selectedL4Id);
    const l3 = L3_PROCESS_NODES.find((n) => n.id === l4?.parentId);
    const l2 = L2_PROCESS_AREAS.find((area) => area.id === l3?.parentId);

    const processPath = [l2?.title || "", l3?.title || "", l4?.title || ""].filter(Boolean);

    const trx: Transaction = {
      transaction_id: newId,
      name,
      process_path: processPath,
      system_context: createDraft.system ? [createDraft.system] : [],
      performed_by_personas: createDraft.personaId ? [createDraft.personaId] : [],
      intent: createDraft.intent.trim(),
      version: "0.1",
      status: "Draft",
      steps: [],
      emitted_events: [],
      system_actions: [],
    };

    setData((d: any) => {
      const nodes: ProcessNode[] = (d.l4_process_nodes ?? DEFAULT_L4_PROCESS_NODES) as ProcessNode[];
      const nextNodes = nodes.map((n) => {
        if (n.id !== selectedL4Id) return n;
        const existing = n.transactionIds ?? [];
        if (existing.includes(newId)) return n;
        return { ...n, transactionIds: [...existing, newId] };
      });

      return {
        ...d,
        transactions: [trx, ...(d.transactions ?? [])],
        l4_process_nodes: nextNodes,
      };
    });

    setCreateOpen(false);

    setSelectedTransactionId(newId);
    setTransactionsInitialView("detail");
    setTab("transactions");
  }
  // ================================================
  // END - Helper Functions
  // ================================================

  return (
    <Panel title="Processes">
      {/* ... the rest of your return JSX is unchanged ... */}
      {processesView === "l2" ? (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Level 2 process areas — hover to explore, click to open.</div>
          <ProcessesL2Accordion
            areas={L2_PROCESS_AREAS as any}
            onOpen={(area) => {
              setSelectedL2Id(area.id);
              setSelectedL3Id(null);
              setSelectedL4Id(null);
              setProcessesView("l2Detail");
            }}
          />
        </div>
      ) : processesView === "l2Detail" ? (
        /* ... your existing l2Detail JSX (unchanged) ... */
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setProcessesView("l2");
                setSelectedL2Id(null);
                setSelectedL3Id(null);
                setSelectedL4Id(null);
              }}
            >
              ← Back to L2
            </Button>

            <div style={{ display: "flex", gap: 8 }}>
              <Button variant={l3ViewMode === "cards" ? "primary" : "secondary"} onClick={() => setL3ViewMode("cards")}>
                Cards
              </Button>
              <Button variant={l3ViewMode === "table" ? "primary" : "secondary"} onClick={() => setL3ViewMode("table")}>
                Table
              </Button>
            </div>
          </div>

          {l3Nodes.length === 0 ? (
            <div style={{ color: "#6b7280" }}>No Level 3 processes defined yet.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {l3Nodes.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedL3Id(p.id);
                    setSelectedL4Id(null);
                    setProcessesView("l3Detail");
                  }}
                  style={{ cursor: "pointer", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white", display: "grid", gap: 8 }}
                >
                  <div style={{ fontWeight: 800 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{p.description}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ... your existing l3Detail JSX (unchanged) ... */
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedL4Id(null);
                setProcessesView("l2Detail");
              }}
            >
              ← Back to L3
            </Button>

            <div style={{ display: "flex", gap: 8 }}>
              <Button variant={l3ViewMode === "cards" ? "primary" : "secondary"} onClick={() => setL3ViewMode("cards")}>
                Cards
              </Button>
              <Button variant={l3ViewMode === "table" ? "primary" : "secondary"} onClick={() => setL3ViewMode("table")}>
                Table
              </Button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {l4Nodes.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedL4Id(p.id)}
                style={{ cursor: "pointer", border: selectedL4Id === p.id ? "2px solid #111827" : "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white", display: "grid", gap: 8 }}
              >
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{p.description}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.id}</div>
              </div>
            ))}
          </div>

          {!selectedL4Id || !selectedL4 ? (
            <div style={{ fontSize: 12, color: "#6b7280" }}>Select an L4 step to see linked transactions (L5).</div>
          ) : (
            <Panel title="Transactions (L5)">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Link an existing transaction to this L4 step (or create a new one):</div>
                <Button variant="secondary" onClick={openCreateAndLink}>
                  + New Transaction (and link)
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Transaction</div>
                  <Select value={linkTrxToL4Id} onChange={setLinkTrxToL4Id} options={[{ value: "", label: "Select transaction..." }, ...trxOptions]} />
                </div>
                <Button variant="secondary" onClick={() => linkTransactionToSelectedL4(linkTrxToL4Id)} disabled={!linkTrxToL4Id}>
                  + Link
                </Button>
              </div>

              {createOpen ? (
                /* ... your existing create modal JSX (unchanged) ... */
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 20000 }}>
                  <div style={{ width: "min(760px, 96vw)", background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>New Transaction (auto-linked to this L4 step)</div>
                      <Button variant="secondary" onClick={() => setCreateOpen(false)}>Close</Button>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ display: "grid", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Name</div>
                        <Input value={createDraft.name} onChange={(v) => setCreateDraft((d) => ({ ...d, name: v }))} placeholder="e.g., Approve Requisition (Manager)" />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System (optional)</div>
                        <Select value={createDraft.system} onChange={(v) => setCreateDraft((d) => ({ ...d, system: v }))} options={[{ value: "", label: "Select system..." }, ...systemOptions]} />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Persona (optional for now)</div>
                        <Select value={createDraft.personaId} onChange={(v) => setCreateDraft((d) => ({ ...d, personaId: v }))} options={[{ value: "", label: "Select persona..." }, ...personaOptions]} />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Intent (optional)</div>
                        <Textarea value={createDraft.intent} onChange={(v) => setCreateDraft((d) => ({ ...d, intent: v }))} placeholder="What is this transaction trying to achieve?" />
                      </div>

                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={createAndLinkTransaction} disabled={!createDraft.name.trim()}>Create & Open</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {(selectedL4.transactionIds ?? []).length === 0 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>No transactions linked to this step yet.</div>
              ) : linkedTransactions.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>Transactions linked, but not found in library: {(selectedL4.transactionIds ?? []).join(", ")}</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {linkedTransactions.map((t) => (
                    <div key={t.transaction_id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "white", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {t.name}
                          {personaSuffixForTransaction(t)}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{t.transaction_id}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedTransactionId(t.transaction_id);
                            setTransactionsInitialView("detail");
                            setTab("transactions");
                          }}
                        >
                          Open
                        </Button>
                        <Button variant="ghost" onClick={() => unlinkTransactionFromSelectedL4(t.transaction_id)}>
                          Unlink
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>
      )}
    </Panel>
  );
}