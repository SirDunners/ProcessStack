import React, { useMemo, useState } from "react";

type TransactionDetailProps = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  getAvatarForPersona?: (persona: any) => any;

  selectedTransactionId: string;
  setSelectedTransactionId: (id: string) => void;

  selectedTransaction: any;

  trxOptions: { value: string; label: string }[];
  personaOptions: { value: string; label: string }[];
  systemOptions: { value: string; label: string }[];

  getLinkedProcessStepsForTransaction: (trxId: string) => any[];

  onOpenProcessStep?: (l4Id: string) => void;

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

  updateTransaction: (updater: (t: any) => any) => void;
};

type LinkType = "mandatory" | "optional" | "conditional";

type TransactionLink = {
  id: string;
  from: string;
  to: string;
  type: LinkType;
  label?: string;
  condition?: string;
};

type StepType = "navigation" | "data" | "decision";

type Step = {
  id: string;
  type: StepType;
  action: string;
  ui_hint?: string;
  data_model_ref?: string;
  required_fields?: string[];
};

type SystemActionType = "email" | "field_update" | "integration" | "status_change" | "record_update" | "other";

type SystemActionTrigger = "on_save" | "on_status_change" | "conditional" | "manual";

type SystemAction = {
  id: string;
  action_type: SystemActionType;
  trigger: SystemActionTrigger;
  target: string;
  description: string;
  condition?: string;
};

type EmittedEvent = {
  event_type: string;
  when: string;
  entity: string;
};

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

function badgeStyle(kind: StepType) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #ddd",
    marginRight: 8,
  };
  if (kind === "data") return { ...base, background: "#e7f0ff", borderColor: "#bcd3ff" };
  if (kind === "navigation") return { ...base, background: "#f4f4f4" };
  return { ...base, background: "#fff7e6", borderColor: "#ffd89b" };
}

export default function TransactionDetail(props: TransactionDetailProps) {
  const {
    data,
    setData,
    selectedTransactionId,
    setSelectedTransactionId,
    selectedTransaction,
    trxOptions,
    systemOptions,
    getLinkedProcessStepsForTransaction,
    Panel,
    Button,
    Input,
    Textarea,
    Select,
    updateTransaction,
    onOpenProcessStep,
    getAvatarForPersona,
  } = props;

  // -------------------------
  // Local UI state (detail-only)
  // -------------------------

  // Allowed Personas picker
  const [personaToAddId, setPersonaToAddId] = useState<string>("");
  const [personaEditMode, setPersonaEditMode] = useState(false);

  // Flow links (inline add for now; you’ll modal-ise later)
  const [linkDirection, setLinkDirection] = useState<"next" | "prev">("next");
  const [linkTargetId, setLinkTargetId] = useState<string>("");
  const [linkType, setLinkType] = useState<LinkType>("mandatory");
  const [linkLabel, setLinkLabel] = useState<string>("");
  const [linkCondition, setLinkCondition] = useState<string>("");

  // Steps CRUD
  const [stepDraft, setStepDraft] = useState<{
    type: StepType;
    action: string;
    ui_hint: string;
    data_model_ref: string;
    required_field_ids: string[];
    required_fields_search: string;
  }>({
    type: "navigation",
    action: "",
    ui_hint: "",
    data_model_ref: "",
    required_field_ids: [],
    required_fields_search: "",
  });


  const [editStepOpen, setEditStepOpen] = useState(false);
  const [editStepId, setEditStepId] = useState<string | null>(null);

  // System Actions CRUD
  const [actionDraft, setActionDraft] = useState<{
    action_type: SystemActionType;
    trigger: SystemActionTrigger;
    target: string;
    description: string;
    condition: string;
  }>({
    action_type: "integration",
    trigger: "on_save",
    target: "",
    description: "",
    condition: "",
  });

  const [editActionOpen, setEditActionOpen] = useState(false);
  const [editActionId, setEditActionId] = useState<string | null>(null);

  // Emitted Events CRUD
  const [eventDraft, setEventDraft] = useState<{ event_type: string; when: string; entity: string }>({
    event_type: "",
    when: "On Save",
    entity: "",
  });

  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);

  // -------------------------
  // Derived data
  // -------------------------

  const allLinks: TransactionLink[] = (data?.transaction_links ?? []) as TransactionLink[];

  const linkedSteps = useMemo(() => {
    return getLinkedProcessStepsForTransaction(selectedTransactionId) ?? [];
  }, [getLinkedProcessStepsForTransaction, selectedTransactionId]);

// -------------------------
// Data Models (for DATA steps)
// -------------------------
const dataModels = (data?.data_models ?? []) as any[];

const dataModelOptions = useMemo(() => {
  return dataModels
    .map((m: any) => ({
      value: m.model_id,
      label: `${m.system} > ${m.entity}`,
    }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label));
}, [dataModels]);

function getModelById(model_id: string) {
  return dataModels.find((m: any) => m.model_id === model_id);
}

function resolveFieldIds(model_id: string, tokens: string[]) {
  // Migrates older tokens (like "jobCode") to internal field IDs if possible.
  // If token already looks like a field_id (starts with model_id.), keep it.
  const model = getModelById(model_id);
  const fields = model?.fields ?? [];
  const byId = new Map<string, any>();
  const bySource = new Map<string, any>();

  fields.forEach((f: any) => {
    if (f?.field_id) byId.set(String(f.field_id), f);
    if (f?.source_field_code) bySource.set(String(f.source_field_code).toLowerCase(), f);
  });

  const out: string[] = [];
  (tokens ?? []).forEach((t) => {
    const token = String(t ?? "").trim();
    if (!token) return;

    if (token.startsWith(model_id + ".")) {
      out.push(token);
      return;
    }

    const mapped = bySource.get(token.toLowerCase());
    if (mapped?.field_id) out.push(mapped.field_id);
    else out.push(token); // fallback (keeps old values rather than losing them)
  });

  // de-dupe
  return Array.from(new Set(out));
}


  if (!selectedTransaction) {
    return <div style={{ color: "#6b7280" }}>No transaction selected.</div>;
  }

  // Personas for Allowed Personas panel
      const assignedPersonaIds: string[] = selectedTransaction.performed_by_personas ?? [];
    const assignedPersonaId: string = assignedPersonaIds[0] ?? "";
    const assignedPersona = (data.personas ?? []).find((p: any) => p.persona_id === assignedPersonaId);
    const availablePersonaOptions = (data.personas ?? []).map((p: any) => ({
      value: p.persona_id,
      label: `${p.display_name} (${p.persona_type})`,
    }));


  // -------------------------
  // Flow Link helpers
  // -------------------------

  function addTransactionLink() {
    const target = linkTargetId.trim();
    if (!target || target === selectedTransactionId) return;

    const from = linkDirection === "next" ? selectedTransactionId : target;
    const to = linkDirection === "next" ? target : selectedTransactionId;

    const newLink: TransactionLink = {
      id: `LNK-${uid()}`,
      from,
      to,
      type: linkType,
      label: linkLabel.trim() || undefined,
      condition: linkType === "conditional" ? (linkCondition.trim() || undefined) : undefined,
    };

    setData((d: any) => ({
      ...d,
      transaction_links: [newLink, ...(d.transaction_links ?? [])],
    }));

    setLinkDirection("next");
    setLinkTargetId("");
    setLinkType("mandatory");
    setLinkLabel("");
    setLinkCondition("");
  }

  function removeTransactionLink(linkId: string) {
    setData((d: any) => ({
      ...d,
      transaction_links: (d.transaction_links ?? []).filter((x: TransactionLink) => x.id !== linkId),
    }));
  }

  // -------------------------
  // Steps helpers
  // -------------------------

  function normalizeSteps(steps: Step[]) {
    return (steps ?? []).map((s, i) => ({ ...s, id: `S${i + 1}` }));
  }

  function addStepFromDraft() {
    const action = stepDraft.action.trim();
    if (!action) return;

    const next: Step = {
      id: "S1",
      type: stepDraft.type,
      action,
      ui_hint: stepDraft.ui_hint.trim() || undefined,
      data_model_ref: stepDraft.type === "data" ? (stepDraft.data_model_ref.trim() || undefined) : undefined,
      required_fields: stepDraft.type === "data" ? (stepDraft.required_field_ids ?? []) : undefined,
    };

    updateTransaction((t: any) => ({
      ...t,
      steps: normalizeSteps([...(t.steps ?? []), next]),
    }));

 
    setStepDraft({
      type: "navigation",
      action: "",
      ui_hint: "",
      data_model_ref: "",
      required_field_ids: [],
      required_fields_search: "",
    });

  }

  function openEditStep(step: Step) {
    setEditStepId(step.id);
  
    const modelRef = step.data_model_ref ?? "";
    const req = (step.required_fields ?? []) as string[];
  
    setStepDraft({
      type: step.type,
      action: step.action ?? "",
      ui_hint: step.ui_hint ?? "",
      data_model_ref: modelRef,
      required_field_ids: modelRef ? resolveFieldIds(modelRef, req) : req,
      required_fields_search: "",
    });
  
    setEditStepOpen(true);
  }






  function saveEditStep() {
    if (!editStepId) return;
    const action = stepDraft.action.trim();
    if (!action) return;
  
    updateTransaction((t: any) => {
      const updated = (t.steps ?? []).map((s: Step) => {
        if (s.id !== editStepId) return s;
  
        return {
          ...s,
          type: stepDraft.type,
          action,
          ui_hint: stepDraft.ui_hint.trim() || undefined,
          data_model_ref: stepDraft.type === "data" ? (stepDraft.data_model_ref.trim() || undefined) : undefined,
          required_fields: stepDraft.type === "data" ? (stepDraft.required_field_ids ?? []) : undefined,
        };
      });
  
      return { ...t, steps: normalizeSteps(updated) };
    });
  
    setEditStepOpen(false);
    setEditStepId(null);
  
    setStepDraft({
      type: "navigation",
      action: "",
      ui_hint: "",
      data_model_ref: "",
      required_field_ids: [],
      required_fields_search: "",
    });
  }

  // -------------------------
  // System Actions helpers
  // -------------------------

  function addSystemActionFromDraft() {
    const target = actionDraft.target.trim();
    const description = actionDraft.description.trim();
    if (!target || !description) return;

    const next: SystemAction = {
      id: `ACT-${uid()}`,
      action_type: actionDraft.action_type,
      trigger: actionDraft.trigger,
      target,
      description,
      condition: actionDraft.trigger === "conditional" ? (actionDraft.condition.trim() || undefined) : undefined,
    };

    updateTransaction((t: any) => ({
      ...t,
      system_actions: [...(t.system_actions ?? []), next],
    }));

    setActionDraft({
      action_type: "integration",
      trigger: "on_save",
      target: "",
      description: "",
      condition: "",
    });
  }

  function openEditSystemAction(a: SystemAction) {
    setEditActionId(a.id);
    setActionDraft({
      action_type: a.action_type,
      trigger: a.trigger,
      target: a.target ?? "",
      description: a.description ?? "",
      condition: a.condition ?? "",
    });
    setEditActionOpen(true);
  }

  function saveEditSystemAction() {
    if (!editActionId) return;
    const target = actionDraft.target.trim();
    const description = actionDraft.description.trim();
    if (!target || !description) return;

    updateTransaction((t: any) => {
      const updated = (t.system_actions ?? []).map((a: SystemAction) => {
        if (a.id !== editActionId) return a;
        return {
          ...a,
          action_type: actionDraft.action_type,
          trigger: actionDraft.trigger,
          target,
          description,
          condition: actionDraft.trigger === "conditional" ? (actionDraft.condition.trim() || undefined) : undefined,
        };
      });
      return { ...t, system_actions: updated };
    });

    setEditActionOpen(false);
    setEditActionId(null);
    setActionDraft({
      action_type: "integration",
      trigger: "on_save",
      target: "",
      description: "",
      condition: "",
    });
  }

  function deleteSystemAction(actionId: string) {
    updateTransaction((t: any) => ({
      ...t,
      system_actions: (t.system_actions ?? []).filter((a: SystemAction) => a.id !== actionId),
    }));
  }

  // -------------------------
  // Emitted Events helpers
  // -------------------------

  function addEmittedEventFromDraft() {
    const et = eventDraft.event_type.trim();
    const wh = eventDraft.when.trim();
    const en = eventDraft.entity.trim();
    if (!et || !wh || !en) return;

    const next: EmittedEvent = { event_type: et, when: wh, entity: en };

    updateTransaction((t: any) => ({
      ...t,
      emitted_events: [...(t.emitted_events ?? []), next],
    }));

    setEventDraft({ event_type: "", when: "On Save", entity: "" });
  }

  function openEditEmittedEvent(idx: number) {
    const e = (selectedTransaction.emitted_events ?? [])[idx];
    if (!e) return;

    setEditEventIndex(idx);
    setEventDraft({
      event_type: e.event_type ?? "",
      when: e.when ?? "On Save",
      entity: e.entity ?? "",
    });
    setEditEventOpen(true);
  }

  function saveEditEmittedEvent() {
    if (editEventIndex === null) return;

    const et = eventDraft.event_type.trim();
    const wh = eventDraft.when.trim();
    const en = eventDraft.entity.trim();
    if (!et || !wh || !en) return;

    updateTransaction((t: any) => {
      const next = [...(t.emitted_events ?? [])];
      if (!next[editEventIndex]) return t;
      next[editEventIndex] = { event_type: et, when: wh, entity: en };
      return { ...t, emitted_events: next };
    });

    setEditEventOpen(false);
    setEditEventIndex(null);
    setEventDraft({ event_type: "", when: "On Save", entity: "" });
  }

  function deleteEmittedEvent(idx: number) {
    updateTransaction((t: any) => ({
      ...t,
      emitted_events: (t.emitted_events ?? []).filter((_: any, i: number) => i !== idx),
    }));
  }

  // -------------------------
  // Render
  // -------------------------

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Select transaction</div>
        <Select value={selectedTransactionId} onChange={setSelectedTransactionId} options={trxOptions} />
      </div>

      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Panel title="Basics">
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Name</div>
              <Input value={selectedTransaction.name} onChange={(v) => updateTransaction((t: any) => ({ ...t, name: v }))} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Process Step</div>

              {linkedSteps.length === 0 ? (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  Not linked to a Level 4 step yet. Link it from Processes (L4 → Transactions).
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  {/* Primary link (clickable) */}



                  <Button
                    variant="secondary"
                    disabled={!linkedSteps[0]?.l4?.id || !onOpenProcessStep}
                    onClick={() => {
                      const l4Id = linkedSteps[0]?.l4?.id;
                      if (l4Id) onOpenProcessStep?.(l4Id);
                    }}
                  >
                    {linkedSteps[0]?.breadcrumbText ?? "Open Process Step"}
                  </Button>



                  {/* Secondary links (also clickable) */}
                  {linkedSteps.length > 1 ? (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      Also linked to:{" "}
                      {linkedSteps.slice(1).map((x: any, idx: number) => (
                        <span key={x?.l4?.id ?? idx}>
                          <button
                            type="button"
                            onClick={() => {
                              const l4Id = x?.l4?.id;
                              if (l4Id) onOpenProcessStep?.(l4Id);
                            }}
                            disabled={!x?.l4?.id || !onOpenProcessStep}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              margin: 0,
                              cursor: x?.l4?.id && onOpenProcessStep ? "pointer" : "default",
                              textDecoration: x?.l4?.id && onOpenProcessStep ? "underline" : "none",
                              color: x?.l4?.id && onOpenProcessStep ? "#111827" : "#6b7280",
                              fontSize: 12,
                            }}
                            title={x?.l4?.id ? "Open this process step" : "No linked L4 step"}
                          >
                            {x?.breadcrumbText}
                          </button>
                          {idx < linkedSteps.slice(1).length - 1 ? " | " : ""}
                        </span>
                      ))}
                    </div>
                  ) : null}

                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System context</div>
              <Select
                value={selectedTransaction.system_context?.[0] ?? ""}
                onChange={(v) => updateTransaction((t: any) => ({ ...t, system_context: v ? [v] : [] }))}
                options={[{ value: "", label: "Select system..." }, ...systemOptions]}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Intent</div>
              <Textarea value={selectedTransaction.intent} onChange={(v) => updateTransaction((t: any) => ({ ...t, intent: v }))} />
            </div>
          </div>
        </Panel>


        <Panel title="Persona">
  <div style={{ display: "grid", gap: 12 }}>
    {(() => {
      const assignedIds: string[] = selectedTransaction.performed_by_personas ?? [];
      const assignedId = assignedIds[0] ?? "";
      const assignedPersona = (data.personas ?? []).find((p: any) => p.persona_id === assignedId);

      return (
        <>
          {/* Picker (only visible when editing OR when no persona selected) */}
          {personaEditMode || !assignedPersona ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Select persona</div>
                  <Select
                    value={personaToAddId}
                    onChange={setPersonaToAddId}
                    options={[
                      { value: "", label: "Select persona..." },
                      ...(data.personas ?? []).map((p: any) => ({
                        value: p.persona_id,
                        label: `${p.display_name} (${p.persona_type})`,
                      })),
                    ]}
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="secondary"
                    disabled={!personaToAddId}
                    onClick={() => {
                      const pid = personaToAddId.trim();
                      if (!pid) return;

                      // ✅ Enforce ONE persona per transaction
                      updateTransaction((t: any) => ({
                        ...t,
                        performed_by_personas: [pid],
                      }));

                      setPersonaToAddId("");
                      setPersonaEditMode(false);
                    }}
                  >
                    + Add
                  </Button>

                  {/* Show Cancel only if we were editing an existing persona */}
                  {assignedPersona ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPersonaToAddId("");
                        setPersonaEditMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* Persona card (only visible once selected and NOT editing) */}
          {assignedPersona && !personaEditMode ? (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "white",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 12, fontWeight: 800, textAlign: "center" }}>
                {assignedPersona.display_name}
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8 }}>
                  {(() => {
                    const av = getAvatarForPersona?.(assignedPersona);
                    return av?.image_url ? (
                      <img
                        src={av.image_url}
                        alt={assignedPersona.display_name}
                        style={{ width: "100%", display: "block" }}
                      />
                    ) : (
                      <div style={{ color: "#6b7280", fontSize: 12, padding: 10, textAlign: "center" }}>
                        No avatar assigned
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ✅ Edit button directly under the avatar frame */}
              <div style={{ padding: 12, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Pre-fill picker with current persona, then show it
                    setPersonaToAddId(assignedPersona.persona_id);
                    setPersonaEditMode(true);
                  }}
                >
                  Edit
                </Button>
              </div>

              <div style={{ padding: 12, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                {assignedPersona.persona_id} • {assignedPersona.persona_type}
              </div>
            </div>
          ) : null}
        </>
      );
    })()}
  </div>
</Panel>

      </div>

      {/* Flow Links */}
      <Panel title="Flow Links">
        {(() => {
          const preds = allLinks.filter((l) => l.to === selectedTransactionId);
          const nexts = allLinks.filter((l) => l.from === selectedTransactionId);
          const trxById = new Map((data.transactions ?? []).map((t: any) => [t.transaction_id, t]));

          const typePill = (t: LinkType) => {
            const base: React.CSSProperties = { fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid #e5e7eb" };
            if (t === "mandatory") return { ...base, background: "#ecfeff", borderColor: "#a5f3fc" };
            if (t === "optional") return { ...base, background: "#f3f4f6" };
            return { ...base, background: "#fff7ed", borderColor: "#fed7aa" };
          };

          return (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, background: "white" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Add link</div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 160px", gap: 8, alignItems: "end" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Direction</div>
                    <Select
                      value={linkDirection}
                      onChange={(v) => setLinkDirection(v as any)}
                      options={[
                        { value: "next", label: "Next step" },
                        { value: "prev", label: "Predecessor" },
                      ]}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Target transaction</div>
                    <Select
                      value={linkTargetId}
                      onChange={setLinkTargetId}
                      options={[
                        { value: "", label: "Select..." },
                        ...trxOptions.filter((o) => o.value !== selectedTransactionId),
                      ]}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Type</div>
                    <Select
                      value={linkType}
                      onChange={(v) => setLinkType(v as LinkType)}
                      options={[
                        { value: "mandatory", label: "Mandatory" },
                        { value: "optional", label: "Optional" },
                        { value: "conditional", label: "Conditional" },
                      ]}
                    />
                  </div>
                </div>

                <div style={{ height: 8 }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Label (optional)</div>
                    <Input value={linkLabel} onChange={setLinkLabel} placeholder='e.g., "Approved", "Rejected"' />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Condition (optional)</div>
                    <Input value={linkCondition} onChange={setLinkCondition} placeholder='e.g., "If salary grading required"' />
                  </div>

                  <div>
                    <Button variant="secondary" onClick={addTransactionLink} disabled={!linkTargetId}>
                      + Add
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                  Tip: use <strong>Type = Conditional</strong> + Label/Condition for branching paths.
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Predecessors</div>
                {preds.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No predecessors linked yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {preds.map((l) => {
                      const t = trxById.get(l.from);
                      return (
                        <div
                          key={l.id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: 10,
                            background: "white",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={typePill(l.type)}>{l.type.toUpperCase()}</span>
                              <div style={{ fontWeight: 700 }}>{t?.name ?? l.from}</div>
                            </div>
                            {(l.label || l.condition) && (
                              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                {l.label ? <strong>{l.label}</strong> : null}
                                {l.label && l.condition ? " — " : null}
                                {l.condition ?? ""}
                              </div>
                            )}
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                              {l.from} → {l.to}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <Button variant="secondary" onClick={() => setSelectedTransactionId(l.from)}>
                              Open
                            </Button>
                            <Button variant="ghost" onClick={() => removeTransactionLink(l.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Next steps</div>
                {nexts.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No next steps linked yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {nexts.map((l) => {
                      const t = trxById.get(l.to);
                      return (
                        <div
                          key={l.id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: 10,
                            background: "white",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={typePill(l.type)}>{l.type.toUpperCase()}</span>
                              <div style={{ fontWeight: 700 }}>{t?.name ?? l.to}</div>
                            </div>
                            {(l.label || l.condition) && (
                              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                {l.label ? <strong>{l.label}</strong> : null}
                                {l.label && l.condition ? " — " : null}
                                {l.condition ?? ""}
                              </div>
                            )}
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                              {l.from} → {l.to}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <Button variant="secondary" onClick={() => setSelectedTransactionId(l.to)}>
                              Open
                            </Button>
                            <Button variant="ghost" onClick={() => removeTransactionLink(l.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Panel>

      {/* Steps */}
      <Panel title="Steps">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Add step</div>

            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Type</div>
                
                  <Select
                    value={stepDraft.type}
                    onChange={(v) => setStepDraft((d) => ({ ...d, type: v as StepType }))}
                    options={[
                      { value: "navigation", label: "Navigation" },
                      { value: "data", label: "Data" },
                      { value: "decision", label: "Decision" },
                    ]}
                  />

              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Action</div>
                <Input
                  value={stepDraft.action}
                  onChange={(v) => setStepDraft((d) => ({ ...d, action: v }))}
                  placeholder='e.g., "Open SuccessFactors home"'
                />
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>UI hint (optional)</div>
              <Input value={stepDraft.ui_hint} onChange={(v) => setStepDraft((d) => ({ ...d, ui_hint: v }))} placeholder='e.g., "Header action"' />
            </div>

            {stepDraft.type === "data" ? (
  <>
    <div style={{ height: 10 }} />

    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Data model</div>
        <Select
          value={stepDraft.data_model_ref}
          onChange={(v) => {
            // when model changes, clear selections
            setStepDraft((d) => ({
              ...d,
              data_model_ref: v,
              required_field_ids: [],
              required_fields_search: "",
            }));
          }}
          options={[{ value: "", label: "Select model..." }, ...dataModelOptions]}
        />
      </div>

      {/* Required fields picklist */}
      {stepDraft.data_model_ref ? (
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Required fields</div>

          <Input
            value={stepDraft.required_fields_search}
            onChange={(v) => setStepDraft((d) => ({ ...d, required_fields_search: v }))}
            placeholder="Search fields..."
          />

          <div style={{ height: 8 }} />

          {(() => {
            const model = getModelById(stepDraft.data_model_ref);
            const fields = model?.fields ?? [];
            const q = stepDraft.required_fields_search.trim().toLowerCase();

            const filtered = !q
              ? fields
              : fields.filter((f: any) => {
                  const hay = `${f.field_id} ${f.source_field_code ?? ""} ${f.label ?? ""}`.toLowerCase();
                  return hay.includes(q);
                });

            return (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "white",
                  padding: 10,
                  maxHeight: 220,
                  overflow: "auto",
                  display: "grid",
                  gap: 8,
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No fields found.</div>
                ) : (
                  filtered.map((f: any) => {
                    const checked = (stepDraft.required_field_ids ?? []).includes(f.field_id);
                    return (
                      <label
                        key={f.field_id}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...(stepDraft.required_field_ids ?? []), f.field_id]))
                              : (stepDraft.required_field_ids ?? []).filter((id) => id !== f.field_id);

                            setStepDraft((d) => ({ ...d, required_field_ids: next }));
                          }}
                        />
                        <div style={{ display: "grid", gap: 2 }}>
                          <div style={{ fontFamily: "monospace", color: "#6b7280", fontSize: 12 }}>{f.field_id}</div>
                          <div style={{ fontSize: 13 }}>
                            {f.label ?? ""}{" "}
                            {f.source_field_code ? (
                              <span style={{ fontFamily: "monospace", color: "#6b7280" }}>({f.source_field_code})</span>
                            ) : null}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            );
          })()}

          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Selected: {(stepDraft.required_field_ids ?? []).length}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Select a data model to choose fields.</div>
      )}
    </div>
  </>
) : null}

            <div style={{ height: 10 }} />

            <Button onClick={addStepFromDraft} disabled={!stepDraft.action.trim()}>
              + Add step
            </Button>
          </div>

          {(selectedTransaction.steps ?? []).length === 0 ? (
            <div style={{ color: "#6b7280" }}>No steps yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {(selectedTransaction.steps ?? []).map((s: Step, idx: number) => (
                <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 6 }}>
                        <span style={badgeStyle(s.type)}>{s.type.toUpperCase()}</span>
                        <strong>
                          {idx + 1}. {s.action}
                        </strong>
                      </div>

                      {s.ui_hint ? <div style={{ fontSize: 12, color: "#6b7280" }}>{s.ui_hint}</div> : null}

                      {s.type === "data" ? (
                        <div style={{ fontSize: 12, marginTop: 8 }}>
                          <div style={{ color: "#6b7280" }}>
                            Data model ref: <span style={{ fontFamily: "monospace" }}>{s.data_model_ref || "(none)"}</span>
                          </div>
                          <div style={{ color: "#6b7280" }}>Required fields: {(s.required_fields ?? []).join(", ") || "(none)"}</div>
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="secondary" onClick={() => openEditStep(s)}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => deleteStep(s.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editStepOpen ? (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 18000,
              }}
            >
              <div
                style={{
                  width: "min(720px, 96vw)",
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Edit step</div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditStepOpen(false);
                      setEditStepId(null);
                    }}
                  >
                    Close
                  </Button>
                </div>

                <div style={{ height: 12 }} />

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Type</div>
                      <Select
                        value={stepDraft.type}
                        onChange={(v) => setStepDraft((d) => ({ ...d, type: v as StepType }))}
                        options={[
                          { value: "navigation", label: "Navigation" },
                          { value: "data", label: "Data" },
                          { value: "decision", label: "Decision" },
                        ]}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Action</div>
                      <Input value={stepDraft.action} onChange={(v) => setStepDraft((d) => ({ ...d, action: v }))} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>UI hint (optional)</div>
                    <Input value={stepDraft.ui_hint} onChange={(v) => setStepDraft((d) => ({ ...d, ui_hint: v }))} />
                  </div>

                  {stepDraft.type === "data" ? (
  <>
    <div style={{ height: 10 }} />

    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Data model</div>
        <Select
          value={stepDraft.data_model_ref}
          onChange={(v) => {
            // when model changes, clear selections
            setStepDraft((d) => ({
              ...d,
              data_model_ref: v,
              required_field_ids: [],
              required_fields_search: "",
            }));
          }}
          options={[{ value: "", label: "Select model..." }, ...dataModelOptions]}
        />
      </div>

      {/* Required fields picklist */}
      {stepDraft.data_model_ref ? (
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Required fields</div>

          <Input
            value={stepDraft.required_fields_search}
            onChange={(v) => setStepDraft((d) => ({ ...d, required_fields_search: v }))}
            placeholder="Search fields..."
          />

          <div style={{ height: 8 }} />

          {(() => {
            const model = getModelById(stepDraft.data_model_ref);
            const fields = model?.fields ?? [];
            const q = stepDraft.required_fields_search.trim().toLowerCase();

            const filtered = !q
              ? fields
              : fields.filter((f: any) => {
                  const hay = `${f.field_id} ${f.source_field_code ?? ""} ${f.label ?? ""}`.toLowerCase();
                  return hay.includes(q);
                });

            return (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "white",
                  padding: 10,
                  maxHeight: 220,
                  overflow: "auto",
                  display: "grid",
                  gap: 8,
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No fields found.</div>
                ) : (
                  filtered.map((f: any) => {
                    const checked = (stepDraft.required_field_ids ?? []).includes(f.field_id);
                    return (
                      <label
                        key={f.field_id}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...(stepDraft.required_field_ids ?? []), f.field_id]))
                              : (stepDraft.required_field_ids ?? []).filter((id) => id !== f.field_id);

                            setStepDraft((d) => ({ ...d, required_field_ids: next }));
                          }}
                        />
                        <div style={{ display: "grid", gap: 2 }}>
                          <div style={{ fontFamily: "monospace", color: "#6b7280", fontSize: 12 }}>{f.field_id}</div>
                          <div style={{ fontSize: 13 }}>
                            {f.label ?? ""}{" "}
                            {f.source_field_code ? (
                              <span style={{ fontFamily: "monospace", color: "#6b7280" }}>({f.source_field_code})</span>
                            ) : null}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            );
          })()}

          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Selected: {(stepDraft.required_field_ids ?? []).length}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Select a data model to choose fields.</div>
      )}
    </div>
  </>
) : null}

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                    <Button variant="secondary" onClick={() => setEditStepOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditStep} disabled={!stepDraft.action.trim()}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      {/* System Actions */}
      <Panel title="System Actions">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Add system action</div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Action type</div>
                <Select
                  value={actionDraft.action_type}
                  onChange={(v) => setActionDraft((d) => ({ ...d, action_type: v as SystemActionType }))}
                  options={[
                    { value: "integration", label: "Integration trigger" },
                    { value: "field_update", label: "Update field(s)" },
                    { value: "email", label: "Send email" },
                    { value: "status_change", label: "Status change" },
                    { value: "record_update", label: "Create/Update record" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Trigger</div>
                <Select
                  value={actionDraft.trigger}
                  onChange={(v) => setActionDraft((d) => ({ ...d, trigger: v as SystemActionTrigger }))}
                  options={[
                    { value: "on_save", label: "On Save" },
                    { value: "on_status_change", label: "On status change" },
                    { value: "conditional", label: "Conditional" },
                    { value: "manual", label: "Manual" },
                  ]}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Target</div>
                <Input value={actionDraft.target} onChange={(v) => setActionDraft((d) => ({ ...d, target: v }))} placeholder='e.g., "ServiceNow: Create Case"' />
              </div>
            </div>

            <div style={{ height: 10 }} />

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description</div>
              <Input value={actionDraft.description} onChange={(v) => setActionDraft((d) => ({ ...d, description: v }))} placeholder='e.g., "Store returned case ID"' />
            </div>

            {actionDraft.trigger === "conditional" ? (
              <>
                <div style={{ height: 10 }} />
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Condition (optional)</div>
                  <Input value={actionDraft.condition} onChange={(v) => setActionDraft((d) => ({ ...d, condition: v }))} />
                </div>
              </>
            ) : null}

            <div style={{ height: 10 }} />

            <Button onClick={addSystemActionFromDraft} disabled={!actionDraft.target.trim() || !actionDraft.description.trim()}>
              + Add action
            </Button>
          </div>

          {(selectedTransaction.system_actions ?? []).length === 0 ? (
            <div style={{ color: "#6b7280" }}>No system actions yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {(selectedTransaction.system_actions ?? []).map((a: SystemAction) => (
                <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{a.action_type.replaceAll("_", " ")} • {a.trigger.replaceAll("_", " ")}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        <strong>Target:</strong> {a.target}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        <strong>Description:</strong> {a.description}
                      </div>
                      {a.condition ? (
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                          <strong>Condition:</strong> {a.condition}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="secondary" onClick={() => openEditSystemAction(a)}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => deleteSystemAction(a.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editActionOpen ? (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 18500,
              }}
            >
              <div
                style={{
                  width: "min(760px, 96vw)",
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Edit system action</div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditActionOpen(false);
                      setEditActionId(null);
                    }}
                  >
                    Close
                  </Button>
                </div>

                <div style={{ height: 12 }} />

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "220px 220px 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Action type</div>
                      <Select
                        value={actionDraft.action_type}
                        onChange={(v) => setActionDraft((d) => ({ ...d, action_type: v as SystemActionType }))}
                        options={[
                          { value: "integration", label: "Integration trigger" },
                          { value: "field_update", label: "Update field(s)" },
                          { value: "email", label: "Send email" },
                          { value: "status_change", label: "Status change" },
                          { value: "record_update", label: "Create/Update record" },
                          { value: "other", label: "Other" },
                        ]}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Trigger</div>
                      <Select
                        value={actionDraft.trigger}
                        onChange={(v) => setActionDraft((d) => ({ ...d, trigger: v as SystemActionTrigger }))}
                        options={[
                          { value: "on_save", label: "On Save" },
                          { value: "on_status_change", label: "On status change" },
                          { value: "conditional", label: "Conditional" },
                          { value: "manual", label: "Manual" },
                        ]}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Target</div>
                      <Input value={actionDraft.target} onChange={(v) => setActionDraft((d) => ({ ...d, target: v }))} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description</div>
                    <Input value={actionDraft.description} onChange={(v) => setActionDraft((d) => ({ ...d, description: v }))} />
                  </div>

                  {actionDraft.trigger === "conditional" ? (
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Condition (optional)</div>
                      <Input value={actionDraft.condition} onChange={(v) => setActionDraft((d) => ({ ...d, condition: v }))} />
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                    <Button variant="secondary" onClick={() => setEditActionOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditSystemAction} disabled={!actionDraft.target.trim() || !actionDraft.description.trim()}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      {/* Emitted Events */}
      <Panel title="Emitted Events">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Add emitted event</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 220px", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Event type</div>
                <Input value={eventDraft.event_type} onChange={(v) => setEventDraft((d) => ({ ...d, event_type: v }))} placeholder='e.g., "PositionCreated"' />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>When</div>
                <Select
                  value={eventDraft.when}
                  onChange={(v) => setEventDraft((d) => ({ ...d, when: v }))}
                  options={[
                    { value: "On Save", label: "On Save" },
                    { value: "On Submit", label: "On Submit" },
                    { value: "On Status Change", label: "On Status Change" },
                    { value: "After Integration", label: "After Integration" },
                    { value: "Manual", label: "Manual" },
                  ]}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Entity</div>
                <Input value={eventDraft.entity} onChange={(v) => setEventDraft((d) => ({ ...d, entity: v }))} placeholder='e.g., "Position"' />
              </div>
            </div>

            <div style={{ height: 10 }} />

            <Button onClick={addEmittedEventFromDraft} disabled={!eventDraft.event_type.trim() || !eventDraft.when.trim() || !eventDraft.entity.trim()}>
              + Add event
            </Button>
          </div>

          {(selectedTransaction.emitted_events ?? []).length === 0 ? (
            <div style={{ color: "#6b7280" }}>No events yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {(selectedTransaction.emitted_events ?? []).map((e: EmittedEvent, idx: number) => (
                <div
                  key={`${e.event_type}-${idx}`}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 10,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{e.event_type}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      When: {e.when} • Entity: {e.entity}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={() => openEditEmittedEvent(idx)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => deleteEmittedEvent(idx)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editEventOpen ? (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                zIndex: 19000,
              }}
            >
              <div
                style={{
                  width: "min(720px, 96vw)",
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Edit emitted event</div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditEventOpen(false);
                      setEditEventIndex(null);
                      setEventDraft({ event_type: "", when: "On Save", entity: "" });
                    }}
                  >
                    Close
                  </Button>
                </div>

                <div style={{ height: 12 }} />

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Event type</div>
                    <Input value={eventDraft.event_type} onChange={(v) => setEventDraft((d) => ({ ...d, event_type: v }))} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>When</div>
                      <Select
                        value={eventDraft.when}
                        onChange={(v) => setEventDraft((d) => ({ ...d, when: v }))}
                        options={[
                          { value: "On Save", label: "On Save" },
                          { value: "On Submit", label: "On Submit" },
                          { value: "On Status Change", label: "On Status Change" },
                          { value: "After Integration", label: "After Integration" },
                          { value: "Manual", label: "Manual" },
                        ]}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Entity</div>
                      <Input value={eventDraft.entity} onChange={(v) => setEventDraft((d) => ({ ...d, entity: v }))} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                    <Button variant="secondary" onClick={() => setEditEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditEmittedEvent} disabled={!eventDraft.event_type.trim() || !eventDraft.when.trim() || !eventDraft.entity.trim()}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
