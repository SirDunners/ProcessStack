import { useState, useMemo, useEffect } from "react";
import { seed } from "../metadata/seed";
import { loadFromStorage, saveToStorage, STORAGE_KEY } from "../utils/storage";
import { uid } from "../utils/helpers";
import { AVATAR_BANK } from "../avatarBank";

import type {
  Persona,
  PersonaType,
  SystemModel,
  SystemRoleType,
  Transaction,
  TransactionLink,
  Step,
  SystemAction,
  EmittedEvent,
  RunState
} from "../utils/domain";

export function useProcessStackState() {
  // Tabs
  const [tab, setTab] = useState<
    "home" | "architecture" | "processes" | "transactions" | "personas" | "dataModels" | "run"
  >("home");

  const [transactionsInitialView, setTransactionsInitialView] =
    useState<"list" | "detail">("list");

  // Process navigation
  const [processesDeepLinkL4Id, setProcessesDeepLinkL4Id] = useState("");
  const [processesView, setProcessesView] = useState<"l2" | "l2Detail" | "l3Detail">("l2");
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null);
  const [selectedL3Id, setSelectedL3Id] = useState<string | null>(null);
  const [selectedL4Id, setSelectedL4Id] = useState<string | null>(null);
  const [l3ViewMode, setL3ViewMode] = useState<"cards" | "table">("cards");

  // Layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Save status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Data (seed + storage)
  const [data, setData] = useState(() => {
    const saved = loadFromStorage();
    const base = saved ?? seed;

    return {
      ...base,
      systems: Array.isArray((base as any).systems) ? (base as any).systems : seed.systems,
      transaction_links: Array.isArray((base as any).transaction_links)
        ? (base as any).transaction_links
        : seed.transaction_links,
      transactions: Array.isArray((base as any).transactions)
        ? (base as any).transactions.map((t: any) => ({
            ...t,
            system_actions: Array.isArray(t.system_actions) ? t.system_actions : []
          }))
        : seed.transactions,
      data_models: Array.isArray((base as any).data_models) ? (base as any).data_models : []
    };
  });

  // Persona creation
  const [createPersonaOpen, setCreatePersonaOpen] = useState(false);
  const [createPersonaDraft, setCreatePersonaDraft] = useState({
    display_name: "",
    description: "",
    persona_type: "Human" as PersonaType,
    avatar_id: ""
  });

  // System creation
  const [createSystemOpen, setCreateSystemOpen] = useState(false);
  const [createSystemDraft, setCreateSystemDraft] = useState<SystemModel>({
    system_id: "",
    name: "",
    category: "Other",
    modules: [],
    description: "",
    owner: "",
    status: "Active"
  });

  const [newModule, setNewModule] = useState("");

  // Architecture view
  const [architectureView, setArchitectureView] = useState<"home" | "detail">("home");
  const [selectedSystemId, setSelectedSystemId] = useState(seed.systems[0]?.system_id || "");



  const [systemModuleInput, setSystemModuleInput] = useState("");
  const [envName, setEnvName] = useState("");
  const [envUrl, setEnvUrl] = useState("");

  const [roleType, setRoleType] = useState<SystemRoleType>("RBPRole");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  // Persona view
  const [personaView, setPersonaView] = useState<"home" | "detail">("home");

  // Avatar picker
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarSearch, setAvatarSearch] = useState("");

  // Selected items
  const [selectedPersonaId, setSelectedPersonaId] = useState(
    seed.personas?.[0]?.persona_id ?? ""
  );
  const [selectedTransactionId, setSelectedTransactionId] = useState(
    seed.transactions?.[0]?.transaction_id ?? ""
  );

  // New modular tab selections
  const [selectedDataModelId, setSelectedDataModelId] = useState<string>("");
  const [selectedSystemRecordId, setSelectedSystemRecordId] = useState<string>("");
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  const [selectedArchitectureId, setSelectedArchitectureId] = useState<string>("");
  const [selectedProcessNodeId, setSelectedProcessNodeId] = useState<string>("");


  // Transaction linking state
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkCondition, setLinkCondition] = useState("");
  const [linkType, setLinkType] = useState<"mandatory" | "optional" | "conditional">("mandatory");
  const [linkDirection, setLinkDirection] = useState<"next" | "prev">("next");

  // Step editing state
  const [stepDraft, setStepDraft] = useState({
    type: "navigation" as Step["type"],
    action: "",
    ui_hint: "",
    data_model_ref: "",
    required_fields_csv: ""
  });

  const [editStepOpen, setEditStepOpen] = useState(false);
  const [editStepId, setEditStepId] = useState<string | null>(null);

  // System action editing state
  const [actionDraft, setActionDraft] = useState({
    action_type: "integration" as SystemAction["action_type"],
    trigger: "on_save" as SystemAction["trigger"],
    target: "",
    description: "",
    condition: ""
  });

  const [editActionOpen, setEditActionOpen] = useState(false);
  const [editActionId, setEditActionId] = useState<string | null>(null);

  // Emitted event editing state
  const [eventDraft, setEventDraft] = useState({
    event_type: "",
    when: "On Save",
    entity: ""
  });

  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editEventIndex, setEditEventIndex] = useState<number | null>(null);

  // ================================================
  // Derived Data
  // ================================================
  const personasById = useMemo(() => {
    const m = new Map<string, Persona>();
    (data.personas ?? []).forEach((p: Persona) => m.set(p.persona_id, p));
    return m;
  }, [data.personas]);

  const selectedPersona = personasById.get(selectedPersonaId);

  const selectedTransaction = useMemo(() => {
    return (data.transactions ?? []).find(
      (t: Transaction) => t.transaction_id === selectedTransactionId
    );
  }, [data.transactions, selectedTransactionId]);


  const personaOptions = (data.personas ?? []).map((p) => ({
    value: p.persona_id,
    label: p.display_name
  }));
  
  const trxOptions = (data.transactions ?? []).map((t) => ({
    value: t.transaction_id,
    label: t.name
  }));
  

  const systemOptions = (data.systems ?? []).map((s: SystemModel) => ({
    value: s.name,
    label: s.name
  }));
// -------------------------
  // Persona Actions
  // -------------------------
  function openCreatePersona() {
    setCreatePersonaOpen(true);
    setCreatePersonaDraft({
      display_name: "",
      description: "",
      persona_type: "Human" as PersonaType,
      avatar_id: ""
    });
  }

  function closeCreatePersona() {
    setCreatePersonaOpen(false);
  }

  function getAvatarForPersona(p: Persona | undefined | null) {
    const avatarId = p?.avatar_id || "";
    const found = AVATAR_BANK.find((a: any) => a.id === avatarId);
    return found ?? AVATAR_BANK[0];
  }

  function createPersonaFromModal() {
    const name = (createPersonaDraft.display_name || "").trim();
    if (!name) return;

    const newId = `PER-${uid()}`;
    const avatar_id =
      (createPersonaDraft.avatar_id || "").trim() || (AVATAR_BANK[0]?.id ?? "");

    const newPersona: Persona = {
      persona_id: newId,
      persona_type: createPersonaDraft.persona_type,
      display_name: name,
      description: (createPersonaDraft.description || "").trim(),
      status: "Active",
      version: "v1",
      roles: [],
      capabilities: [],
      system_mappings: [],
      avatar_id
    };

    setData((d: any) => ({
      ...d,
      personas: [...(d.personas ?? []), newPersona]
    }));

    setSelectedPersonaId(newId);
    setPersonaView("detail");
    setCreatePersonaOpen(false);

    // reset draft for next time
    setCreatePersonaDraft({
      display_name: "",
      description: "",
      persona_type: "Human" as PersonaType,
      avatar_id: ""
    });
  }

  // -------------------------
  // System Actions
  // -------------------------
  function updateSystem(
    patchOrUpdater: Partial<SystemModel> | ((s: SystemModel) => SystemModel)
  ) {
    setData((d: any) => {
      const systems: SystemModel[] = Array.isArray(d.systems) ? d.systems : [];
      const next = systems.map((s) => {
        if (s.system_id !== selectedSystemId) return s;
        return typeof patchOrUpdater === "function"
          ? (patchOrUpdater as any)(s)
          : { ...s, ...patchOrUpdater };
      });
      return { ...d, systems: next };
    });
  }

  // -------------------------
  // Transaction Actions
  // -------------------------
  function updateTransaction(
    patchOrUpdater: Partial<Transaction> | ((t: Transaction) => Transaction)
  ) {
    if (!selectedTransactionId) return;

    setData((d: any) => {
      const txs: Transaction[] = Array.isArray(d.transactions) ? d.transactions : [];
      const next = txs.map((t) => {
        if (t.transaction_id !== selectedTransactionId) return t;
        return typeof patchOrUpdater === "function"
          ? (patchOrUpdater as any)(t)
          : { ...t, ...patchOrUpdater };
      });
      return { ...d, transactions: next };
    });
  }

  function addTransactionLink() {
    const fromId = selectedTransactionId;
    const toId = linkTargetId.trim();
    if (!fromId || !toId) return;
    if (fromId === toId) return;

    const newLink: TransactionLink = {
      id: `LNK-${uid()}`,
      from: fromId,
      to: toId,
      type: linkType,
      label: linkLabel.trim() || undefined,
      condition: linkType === "conditional" ? (linkCondition.trim() || undefined) : undefined
    };

    setData((d: any) => ({
      ...d,
      transaction_links: [...(d.transaction_links ?? []), newLink]
    }));

    // reset link draft UI state
    setLinkTargetId("");
    setLinkLabel("");
    setLinkCondition("");
    setLinkType("mandatory");
    setLinkDirection("next");
  }
  // ================================================
  // CRUD & Helper Functions
  // ================================================
  function removeTransactionLink(linkId: string) {
    setData((d: any) => ({
      ...d,
      transaction_links: (d.transaction_links ?? []).filter((x: TransactionLink) => x.id !== linkId)
    }));
  }

  function openProcessStepFromTransaction(l4Id: string) {
    if (!l4Id) return;
    setProcessesDeepLinkL4Id(l4Id);
    setTab("processes");
  }

  function normalizeSteps(steps: Step[]) {
    return (steps ?? []).map((s, i) => ({
      ...s,
      id: `S${i + 1}`
    }));
  }

  function addStepFromDraft() {
    const action = stepDraft.action.trim();
    if (!action) return;

    const nextStep: Step = {
      id: "S1",
      type: stepDraft.type,
      action,
      ui_hint: stepDraft.ui_hint.trim() || undefined,
      data_model_ref:
        stepDraft.type === "data"
          ? stepDraft.data_model_ref.trim() || undefined
          : undefined,
      required_fields:
        stepDraft.type === "data"
          ? stepDraft.required_fields_csv
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined
    };

    updateTransaction((t) => ({
      ...t,
      steps: normalizeSteps([...(t.steps ?? []), nextStep])
    }));

    setStepDraft({
      type: "navigation",
      action: "",
      ui_hint: "",
      data_model_ref: "",
      required_fields_csv: ""
    });
  }

  function openEditStep(step: Step) {
    setEditStepId(step.id);
    setStepDraft({
      type: step.type,
      action: step.action || "",
      ui_hint: step.ui_hint || "",
      data_model_ref: step.data_model_ref || "",
      required_fields_csv: (step.required_fields ?? []).join(", ")
    });
    setEditStepOpen(true);
  }

  function saveEditStep() {
    if (!editStepId) return;
    const action = stepDraft.action.trim();
    if (!action) return;

    updateTransaction((t) => {
      const updated = (t.steps ?? []).map((s) => {
        if (s.id !== editStepId) return s;

        return {
          ...s,
          type: stepDraft.type,
          action,
          ui_hint: stepDraft.ui_hint.trim() || undefined,
          data_model_ref:
            stepDraft.type === "data"
              ? stepDraft.data_model_ref.trim() || undefined
              : undefined,
          required_fields:
            stepDraft.type === "data"
              ? stepDraft.required_fields_csv
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              : undefined
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
      required_fields_csv: ""
    });
  }

  function deleteStep(stepId: string) {
    updateTransaction((t) => ({
      ...t,
      steps: normalizeSteps((t.steps ?? []).filter((s) => s.id !== stepId))
    }));
  }

  function normalizeActions(actions: SystemAction[]) {
    return actions ?? [];
  }

  function addSystemActionFromDraft() {
    const target = actionDraft.target.trim();
    const description = actionDraft.description.trim();
    if (!target || !description) return;

    const nextAction: SystemAction = {
      id: `ACT-${uid()}`,
      action_type: actionDraft.action_type,
      trigger: actionDraft.trigger,
      target,
      description,
      condition:
        actionDraft.trigger === "conditional"
          ? actionDraft.condition.trim() || undefined
          : undefined
    };

    updateTransaction((t) => ({
      ...t,
      system_actions: normalizeActions([...(t.system_actions ?? []), nextAction])
    }));

    setActionDraft({
      action_type: "integration",
      trigger: "on_save",
      target: "",
      description: "",
      condition: ""
    });
  }

  function openEditSystemAction(a: SystemAction) {
    setEditActionId(a.id);
    setActionDraft({
      action_type: a.action_type,
      trigger: a.trigger,
      target: a.target || "",
      description: a.description || "",
      condition: a.condition || ""
    });
    setEditActionOpen(true);
  }

  function saveEditSystemAction() {
    if (!editActionId) return;

    const target = actionDraft.target.trim();
    const description = actionDraft.description.trim();
    if (!target || !description) return;

    updateTransaction((t) => {
      const updated = (t.system_actions ?? []).map((a) => {
        if (a.id !== editActionId) return a;

        return {
          ...a,
          action_type: actionDraft.action_type,
          trigger: actionDraft.trigger,
          target,
          description,
          condition:
            actionDraft.trigger === "conditional"
              ? actionDraft.condition.trim() || undefined
              : undefined
        };
      });

      return { ...t, system_actions: normalizeActions(updated) };
    });

    setEditActionOpen(false);
    setEditActionId(null);

    setActionDraft({
      action_type: "integration",
      trigger: "on_save",
      target: "",
      description: "",
      condition: ""
    });
  }

  function deleteSystemAction(actionId: string) {
    updateTransaction((t) => ({
      ...t,
      system_actions: normalizeActions((t.system_actions ?? []).filter((a) => a.id !== actionId))
    }));
  }

  function addEmittedEventFromDraft() {
    const et = eventDraft.event_type.trim();
    const wh = eventDraft.when.trim();
    const en = eventDraft.entity.trim();
    if (!et || !wh || !en) return;

    const newEvent: EmittedEvent = {
      event_type: et,
      when: wh,
      entity: en
    };

    updateTransaction((t) => ({
      ...t,
      emitted_events: [...(t.emitted_events ?? []), newEvent]
    }));

    setEventDraft({ event_type: "", when: "On Save", entity: "" });
  }

  function openEditEmittedEvent(idx: number) {
    const e = (selectedTransaction?.emitted_events ?? [])[idx];
    if (!e) return;

    setEditEventIndex(idx);
    setEventDraft({
      event_type: e.event_type || "",
      when: e.when || "On Save",
      entity: e.entity || ""
    });
    setEditEventOpen(true);
  }

  function saveEditEmittedEvent() {
    if (editEventIndex === null) return;

    const et = eventDraft.event_type.trim();
    const wh = eventDraft.when.trim();
    const en = eventDraft.entity.trim();
    if (!et || !wh || !en) return;

    updateTransaction((t) => {
      const next = [...(t.emitted_events ?? [])];
      if (!next[editEventIndex]) return t;

      next[editEventIndex] = {
        event_type: et,
        when: wh,
        entity: en
      };

      return { ...t, emitted_events: next };
    });

    setEditEventOpen(false);
    setEditEventIndex(null);
    setEventDraft({ event_type: "", when: "On Save", entity: "" });
  }

  function deleteEmittedEvent(idx: number) {
    updateTransaction((t) => ({
      ...t,
      emitted_events: (t.emitted_events ?? []).filter((_, i) => i !== idx)
    }));
  }

  // ================================================
  // Run Engine
  // ================================================
  const [run, setRun] = useState<RunState>(() => ({
    run_id: `RUN-${uid()}`,
    started_at: new Date().toISOString(),
    persona_id: selectedPersonaId,
    transaction_id: selectedTransactionId,
    step_index: 0,
    completed_steps: {},
    evidence: {}
  }));

  function resetRun() {
    setRun({
      run_id: `RUN-${uid()}`,
      started_at: new Date().toISOString(),
      persona_id: selectedPersonaId,
      transaction_id: selectedTransactionId,
      step_index: 0,
      completed_steps: {},
      evidence: {}
    });
  }

  const runPersona = personasById.get(run.persona_id);
  
const runTransaction = (data.transactions ?? []).find(
  (t) => t.transaction_id === run.transaction_id
);

  const currentStep = runTransaction?.steps?.[run.step_index];

  function nextStep() {
    if (!runTransaction) return;
    setRun((r) => ({
      ...r,
      step_index: Math.min(r.step_index + 1, Math.max(0, runTransaction.steps.length - 1))
    }));
  }

  function prevStep() {
    setRun((r) => ({
      ...r,
      step_index: Math.max(r.step_index - 1, 0)
    }));
  }

  function updateEvidence(stepId: string, patch: Partial<RunState["evidence"][string]>) {
    setRun((r) => ({
      ...r,
      evidence: {
        ...r.evidence,
        [stepId]: {
          notes: "",
          observedFields: [],
          ...(r.evidence[stepId] || {}),
          ...patch
        }
      }
    }));
  }

  function exportRunJSON() {
    const payload = {
      ...run,
      persona: runPersona,
      transaction: runTransaction
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert("Copied run JSON to clipboard");
  }

  // ================================================
  // START - Effects
  // ================================================
  useEffect(() => {
    if (tab === "personas") setPersonaView("home");
  }, [tab]);

  useEffect(() => {
    if (tab === "architecture") setArchitectureView("home");
  }, [tab]);

  useEffect(() => {
    saveToStorage(data);
    setSaveStatus("saved");
    const t = setTimeout(() => setSaveStatus("idle"), 1000);
    return () => clearTimeout(t);
  }, [data]);
  // ================================================
  // END - Effects
  // ================================================

  function resetAllData() {
    setData(seed);

    // Reset selections
    setSelectedPersonaId(seed.personas?.[0]?.persona_id ?? "");
    setSelectedTransactionId(seed.transactions?.[0]?.transaction_id ?? "");

    // Reset new modular selections
    setSelectedDataModelId("");
    setSelectedSystemRecordId("");
    setSelectedIntegrationId("");
    setSelectedArchitectureId("");
    setSelectedProcessNodeId("");

    // Reset views
    setPersonaView("home");
    setArchitectureView("home");
    setProcessesView("l2");
  }

  // ================================================
  // Return API
  // ================================================
  return {
    // -------------------------
    // Core State
    // -------------------------
    tab, setTab,
    data, setData,
    saveStatus, setSaveStatus,
    sidebarCollapsed, setSidebarCollapsed,

    // -------------------------
    // Navigation State
    // -------------------------
    transactionsInitialView, setTransactionsInitialView,
    processesDeepLinkL4Id, setProcessesDeepLinkL4Id,
    processesView, setProcessesView,
    selectedL2Id, setSelectedL2Id,
    selectedL3Id, setSelectedL3Id,
    selectedL4Id, setSelectedL4Id,
    l3ViewMode, setL3ViewMode,

    // -------------------------
    // Persona State
    // -------------------------
    personaView, setPersonaView,
    selectedPersonaId, setSelectedPersonaId,
    createPersonaOpen, setCreatePersonaOpen,
    createPersonaDraft, setCreatePersonaDraft,
    avatarPickerOpen, setAvatarPickerOpen,
    avatarSearch, setAvatarSearch,

    // -------------------------
    // New modular tab selections
    // -------------------------
    selectedDataModelId, setSelectedDataModelId,
    selectedSystemRecordId, setSelectedSystemRecordId,
    selectedIntegrationId, setSelectedIntegrationId,
    selectedArchitectureId, setSelectedArchitectureId,
    selectedProcessNodeId, setSelectedProcessNodeId,

    // -------------------------
    // System State
    // -------------------------
    createSystemOpen, setCreateSystemOpen,
    createSystemDraft, setCreateSystemDraft,
    newModule, setNewModule,
    selectedSystemId, setSelectedSystemId,
    architectureView, setArchitectureView,
    systemModuleInput, setSystemModuleInput,
    envName, setEnvName,
    envUrl, setEnvUrl,
    roleType, setRoleType,
    roleName, setRoleName,
    roleDesc, setRoleDesc,

    // -------------------------
    // Transaction State
    // -------------------------
    selectedTransactionId, setSelectedTransactionId,

    // -------------------------
    // Linking
    // -------------------------
    linkTargetId, setLinkTargetId,
    linkLabel, setLinkLabel,
    linkCondition, setLinkCondition,
    linkType, setLinkType,
    linkDirection, setLinkDirection,

    // -------------------------
    // Steps
    // -------------------------
    stepDraft, setStepDraft,
    editStepOpen, setEditStepOpen,
    editStepId, setEditStepId,

    // -------------------------
    // System Actions
    // -------------------------
    actionDraft, setActionDraft,
    editActionOpen, setEditActionOpen,
    editActionId, setEditActionId,

    // -------------------------
    // Emitted Events
    // -------------------------
    eventDraft, setEventDraft,
    editEventOpen, setEditEventOpen,
    editEventIndex, setEditEventIndex,

    // -------------------------
    // Derived Values
    // -------------------------
    personasById,
    selectedPersona,
    selectedTransaction,
    personaOptions,
    trxOptions,
    systemOptions,

    // -------------------------
    // Persona Actions
    // -------------------------
    createPersonaFromModal,
    openCreatePersona,
    closeCreatePersona,
    getAvatarForPersona,

    // -------------------------
    // System Actions
    // -------------------------
    updateSystem,

    // -------------------------
    // Transaction Actions
    // -------------------------
    updateTransaction,
    addTransactionLink,
    removeTransactionLink,
    openProcessStepFromTransaction,

    // Steps
    addStepFromDraft,
    openEditStep,
    saveEditStep,
    deleteStep,

    // System Actions (inside transactions)
    addSystemActionFromDraft,
    openEditSystemAction,
    saveEditSystemAction,
    deleteSystemAction,

    // Emitted Events
    addEmittedEventFromDraft,
    openEditEmittedEvent,
    saveEditEmittedEvent,
    deleteEmittedEvent,

    // -------------------------
    // Global Actions
    // -------------------------
    resetAllData,

    // -------------------------
    // Run Engine
    // -------------------------
    run, setRun,
    resetRun,
    runPersona,
    runTransaction,
    currentStep,
    nextStep,
    prevStep,
    updateEvidence,
    exportRunJSON,
  };
}