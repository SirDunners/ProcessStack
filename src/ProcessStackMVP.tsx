import React, { useEffect, useMemo, useState } from "react";
import ResponsiveSidebar from "./ResponsiveSidebar";
import ProcessesL2Accordion from "./ProcessesL2Accordion";
import ProcessesTab from "./modules/processes/ProcessesTab";
import TransactionsTab from "./modules/transactions/TransactionsTab";
import DataModelsTab from "./modules/dataModels/DataModelsTab";
import { AVATAR_BANK } from "./avatarBank";
import ArchitectureTab from "./modules/architecture/ArchitectureTab";
import psLogo from "./assets/ProcessStack.png";

/**
 * Vite-safe, dependency-light MVP:
 * - No shadcn/ui
 * - No "@/..." imports
 * - No lucide-react
 * - Basic HTML + tiny inline styles
 */

// ================================================
// START - Storage Helpers
// ================================================
const STORAGE_KEY = "process-stack:mvp:v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load saved data:", err);
    return null;
  }
}

function saveToStorage(value: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (err) {
    console.warn("Failed to save data:", err);
  }
}
// ================================================
// END - Storage Helpers
// ================================================

// ================================================
// START - Utility Functions
// ================================================
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
// ================================================
// END - Utility Functions
// ================================================

// ================================================
// START - Type Definitions
// ================================================
type SystemCategory =
  | "HRIS"
  | "ATS"
  | "Assessment"
  | "Portal"
  | "Integration"
  | "Identity"
  | "Analytics"
  | "Other";

type SupportInfo = {
  owner_team: string;          // e.g. "HR Systems"
  contact: string;             // e.g. email or Teams channel
  ticket_url: string;          // e.g. ServiceNow/Jira link
  sla: string;                 // e.g. "P1 1hr / P2 4hr"
  notes?: string;              // free text
};

type SystemEnvironment = {
  name: string;                // e.g. "Prod", "Test", "Preview"
  url: string;                 // URL or base domain
  notes?: string;
};

type SystemRoleType = "RBPRole" | "PermissionSet" | "DynamicRole" | "Group" | "Other";

type SystemRole = {
  role_type: SystemRoleType;
  role_name: string;
  description?: string;
};

type SystemModel = {
  system_id: string;
  name: string;
  category: SystemCategory;
  modules: string[];
  description?: string;
  owner?: string;
  status?: "Active" | "Inactive";
  support?: SupportInfo;
  environments?: SystemEnvironment[];
  roles?: SystemRole[];
};

type ProcessLevel = 2 | 3 | 4 | 5;

type ProcessNode = {
  id: string;
  level: ProcessLevel;
  parentId?: string;
  title: string;
  description: string;
  imageUrl?: string;

  // L5 mapping (transactions linked to this step)
  transactionIds?: string[];
};

type PersonaType = "Human" | "ServiceAccount" | "Robot" | "ExternalEntity";
type StepType = "navigation" | "data" | "decision";

type SystemMapping = { system: string; role_type: string; role_name: string };

type Persona = {
  persona_id: string;
  persona_type: PersonaType;
  display_name: string;
  description: string;
  status: "Active" | "Inactive" | "Deprecated";
  version: string;
  roles: string[];
  capabilities: string[];
  system_mappings: SystemMapping[];
  avatar_id?: string;
};

type Step = {
  id: string;
  type: StepType;
  action: string;
  ui_hint?: string;
  data_model_ref?: string;
  required_fields?: string[];
};

type EmittedEvent = {
  event_type: string;
  when: string;
  entity: string;
};

type SystemActionType = "email" | "field_update" | "integration" | "status_change" | "record_update" | "other";
type SystemActionTrigger = "on_save" | "on_status_change" | "conditional" | "manual";

type SystemAction = {
  id: string;
  action_type: SystemActionType;
  trigger: SystemActionTrigger;
  target: string;        // free text for now (later can be structured refs)
  description: string;   // human readable
  condition?: string;    // optional rule description (logic later)
};

type LinkType = "mandatory" | "optional" | "conditional";

type TransactionLink = {
  id: string;
  from: string; // transaction_id
  to: string;   // transaction_id
  type: LinkType;
  label?: string;     // e.g. "Approved", "Rejected", "If required"
  condition?: string; // human-readable for now; structured logic later
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
  steps: Step[];
  emitted_events: EmittedEvent[];
  system_actions: SystemAction[];
};

type RunState = {
  run_id: string;
  started_at: string;
  persona_id: string;
  transaction_id: string;
  step_index: number;
  completed_steps: Record<string, boolean>;
  evidence: Record<
    string,
    {
      notes: string;
      observedFields: { label: string; type: string; required: boolean; allowedValues: string }[];
    }
  >;
};
// ================================================
// END - Type Definitions
// ================================================

// ================================================
// START - Seed Data
// ================================================
const seed: { personas: Persona[]; transactions: Transaction[]; systems: SystemModel[]; transaction_links: TransactionLink[] } = {
  transaction_links: [],
  personas: [
    {
      persona_id: "PER-000001",
      persona_type: "Human",
      display_name: "HR Administrator",
      description: "Creates and maintains positions, supports position management workflow.",
      status: "Active",
      version: "1.0",
      roles: ["HR_ADMIN"],
      capabilities: ["CreatePosition", "EditPosition"],
      system_mappings: [{ system: "SuccessFactors", role_type: "RBPRole", role_name: "HR Administrator" }],
    },
    {
      persona_id: "PER-000002",
      persona_type: "Human",
      display_name: "Manager",
      description: "Initiates or approves changes for their org area.",
      status: "Active",
      version: "1.0",
      roles: ["MANAGER"],
      capabilities: ["InitiatePositionRequest", "ApproveWorkflow"],
      system_mappings: [{ system: "SuccessFactors", role_type: "DynamicRole", role_name: "Manager (Hierarchy)" }],
    },
  ],
  transactions: [
    {
      transaction_id: "TRX-HR-POS-001",
      name: "Create Position (Lower-Level)",
      process_path: ["Human Resources", "Position Management"],
      system_context: ["SuccessFactors"],
      performed_by_personas: ["PER-000001", "PER-000002"],
      intent: "Create a new lower-level position related to an existing parent position.",
      version: "0.1",
      status: "Draft",
      steps: [
        { id: "S1", type: "navigation", action: "Open SuccessFactors home", ui_hint: "Home URL" },
        { id: "S2", type: "navigation", action: "Click View Org Chart", ui_hint: "Header action" },
        { id: "S3", type: "navigation", action: "Select Position Org Chart", ui_hint: "Org Chart > Position" },
        { id: "S4", type: "navigation", action: "Select parent position", ui_hint: "Org chart node" },
        { id: "S5", type: "navigation", action: "Open Actions menu", ui_hint: "Actions" },
        { id: "S6", type: "navigation", action: "Create Lower-Level Position", ui_hint: "Actions > Create" },
        {
          id: "S7",
          type: "data",
          action: "Complete Position form fields",
          ui_hint: "Position form",
          data_model_ref: "SuccessFactors.Position",
          required_fields: ["positionTitle", "company", "department", "jobCode", "effectiveStartDate"],
        },
        { id: "S8", type: "navigation", action: "Save", ui_hint: "Save button" },
      ],
      emitted_events: [{ event_type: "PositionCreated", when: "On Save", entity: "Position" }],
      system_actions: [],
    },
  ],
  
  systems: [
    {
      system_id: "SYS-000001",
      name: "SuccessFactors",
      category: "HRIS",
      modules: ["Recruiting"],
      description: "",
      owner: "",
      status: "Active",
      support: {
        owner_team: "",
        contact: "",
        ticket_url: "",
        sla: "",
        notes: "",
      },
      environments: [
        { name: "Prod", url: "", notes: "" },
        { name: "Test", url: "", notes: "" },
      ],
      roles: [
        { role_type: "RBPRole", role_name: "HR Administrator", description: "" },
        { role_type: "DynamicRole", role_name: "Manager (Hierarchy)", description: "" },
      ],
    },
    {
      system_id: "SYS-000002",
      name: "Corporate Career Site",
      category: "Portal",
      modules: ["Job Search", "Applications"],
      description: "",
      owner: "",
      status: "Active",
      support: {
        owner_team: "",
        contact: "",
        ticket_url: "",
        sla: "",
        notes: "",
      },
      environments: [
        { name: "Prod", url: "", notes: "" },
        { name: "Test", url: "", notes: "" },
      ],
      roles: [],
    },
    {
      system_id: "SYS-000003",
      name: "Avature",
      category: "ATS",
      modules: ["CRM", "ATS"],
      description: "",
      owner: "",
      status: "Active",
      support: {
        owner_team: "",
        contact: "",
        ticket_url: "",
        sla: "",
        notes: "",
      },
      environments: [
        { name: "Prod", url: "", notes: "" },
        { name: "UAT", url: "", notes: "" },
      ],
      roles: [],
    },
    {
      system_id: "SYS-000004",
      name: "HireVue",
      category: "Assessment",
      modules: ["Video Interviews"],
      description: "",
      owner: "",
      status: "Active",
      support: {
        owner_team: "",
        contact: "",
        ticket_url: "",
        sla: "",
        notes: "",
      },
      environments: [
        { name: "Prod", url: "", notes: "" },
        { name: "Test", url: "", notes: "" },
      ],
      roles: [],
    },
  ],
};
// ================================================
// END - Seed Data
// ================================================

// ================================================
// START - UI Helpers
// ================================================
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
// ================================================
// END - UI Helpers
// ================================================

// ================================================
// START - UI Primitives
// ================================================
function Panel({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12, background: "white" }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "#111827",
      color: "white",
      border: "1px solid #111827",
      padding: "8px 12px",
      borderRadius: 10,
      cursor: "pointer",
    },
    secondary: {
      background: "#f3f4f6",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "8px 12px",
      borderRadius: 10,
      cursor: "pointer",
    },
    ghost: {
      background: "transparent",
      color: "#111827",
      border: "1px solid #e5e7eb",
      padding: "6px 10px",
      borderRadius: 10,
      cursor: "pointer",
    },
  };

  return (
    <button onClick={onClick} style={{ ...styles[variant], opacity: disabled ? 0.5 : 1 }} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
      }}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        resize: "vertical",
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "white",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />;
}
// ================================================
// END - UI Primitives
// ================================================

// ================================================
// START - Modals
// ================================================
function AvatarPickerModal({
  open,
  onClose,
  onSelect,
  selectedAvatarId,
  search,
  setSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (avatarId: string) => void;
  selectedAvatarId?: string;
  search: string;
  setSearch: (v: string) => void;
}) {
  if (!open) return null;

  const filtered = AVATAR_BANK.filter((a) => {
    const hay = `${a.name} ${a.outfit}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 20000,
      }}
    >
      <div
        style={{
          width: "min(980px, 96vw)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "white",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Choose Synthesia Avatar</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ marginTop: 10 }}>
          <Input value={search} onChange={setSearch} placeholder="Search by name or outfit (e.g. 'Ada', 'blazer')..." />
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {filtered.map((a) => {
            const selected = a.avatar_id === selectedAvatarId;
            return (
              <div
                key={a.avatar_id}
                onClick={() => onSelect(a.avatar_id)}
                style={{
                  cursor: "pointer",
                  border: selected ? "2px solid #111827" : "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "white",
                }}
              >
                <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8 }}>
                  <img
                    src={a.image_url}
                    alt={`${a.name} - ${a.outfit}`}
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{a.outfit}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CreatePersonaModal({
  open,
  onClose,
  draft,
  setDraft,
  onCreate,
  onChooseAvatar,
  avatarSummary,
}: {
  open: boolean;
  onClose: () => void;
  draft: { display_name: string; description: string; persona_type: PersonaType; avatar_id: string };
  setDraft: React.Dispatch<
    React.SetStateAction<{ display_name: string; description: string; persona_type: PersonaType; avatar_id: string }>
  >;
  onCreate: () => void;
  onChooseAvatar: () => void;
  avatarSummary: string;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
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
          <div style={{ fontWeight: 800, fontSize: 18 }}>Create Persona</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Display name</div>
            <Input
              value={draft.display_name}
              onChange={(v) => setDraft((d) => ({ ...d, display_name: v }))}
              placeholder="e.g., HR Administrator"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Persona type</div>
            <Select
              value={draft.persona_type}
              onChange={(v) => setDraft((d) => ({ ...d, persona_type: v as PersonaType }))}
              options={[
                { value: "Human", label: "Human" },
                { value: "ServiceAccount", label: "ServiceAccount" },
                { value: "Robot", label: "Robot" },
                { value: "ExternalEntity", label: "ExternalEntity" },
              ]}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description</div>
            <Textarea
              value={draft.description}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              placeholder="Short description"
            />
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Synthesia Avatar</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{avatarSummary}</div>
              </div>
              <Button variant="secondary" onClick={onChooseAvatar}>
                Choose avatar
              </Button>
            </div>
          </div>

          <Button onClick={onCreate}>Create Persona</Button>
        </div>
      </div>
    </div>
  );
}

function CreateSystemModal({
  open,
  onClose,
  draft,
  setDraft,
  onCreate,
  newModule,
  setNewModule,
  onAddModule,
  onRemoveModule,
}: {
  open: boolean;
  onClose: () => void;
  draft: SystemModel;
  setDraft: React.Dispatch<React.SetStateAction<SystemModel>>;
  onCreate: () => void;

  newModule: string;
  setNewModule: (v: string) => void;
  onAddModule: () => void;
  onRemoveModule: (moduleName: string) => void;
}) {
  if (!open) return null;

  const categoryOptions: { value: SystemCategory; label: string }[] = [
    { value: "HRIS", label: "HRIS" },
    { value: "ATS", label: "ATS" },
    { value: "Assessment", label: "Assessment" },
    { value: "Portal", label: "Portal" },
    { value: "Integration", label: "Integration" },
    { value: "Identity", label: "Identity" },
    { value: "Analytics", label: "Analytics" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 15000,
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
          <div style={{ fontWeight: 800, fontSize: 18 }}>Add System</div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>System name</div>
            <Input
              value={draft.name}
              onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
              placeholder="e.g., SuccessFactors / Workday / Avature"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Category</div>
            <Select
              value={draft.category}
              onChange={(v) => setDraft((d) => ({ ...d, category: v as SystemCategory }))}
              options={categoryOptions}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Modules (multi-select)</div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={newModule}
                  onChange={setNewModule}
                  placeholder="Type a module (e.g., Recruiting) then click Add"
                />
              </div>
              <Button variant="secondary" onClick={onAddModule}>
                Add
              </Button>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {draft.modules.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>No modules added yet.</div>
              ) : (
                draft.modules.map((m) => (
                  <div
                    key={m}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 999,
                      padding: "6px 10px",
                      background: "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                    }}
                  >
                    <span>{m}</span>
                    <button
                      onClick={() => onRemoveModule(m)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6b7280" }}
                      aria-label={`Remove ${m}`}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description (optional)</div>
            <Textarea
              value={draft.description || ""}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              placeholder="Short notes about what this system does"
            />
          </div>

          <Button onClick={onCreate}>Create System</Button>
        </div>
      </div>
    </div>
  );
}
// ================================================
// END - Modals
// ================================================

export default function ProcessStackMVP() {
  // ================================================
  // START - Main Component State
  // ================================================
  const [tab, setTab] = useState<
    "home" | "architecture" | "processes" | "transactions" | "personas" | "dataModels" | "run"
  >("home");

  const [transactionsInitialView, setTransactionsInitialView] =
    useState<"list" | "detail">("list");

  const [processesDeepLinkL4Id, setProcessesDeepLinkL4Id] = useState<string>("");
  const [processesView, setProcessesView] = useState<"l2" | "l2Detail" | "l3Detail">("l2");
  const [selectedL2Id, setSelectedL2Id] = useState<string | null>(null);
  const [selectedL3Id, setSelectedL3Id] = useState<string | null>(null);
  const [selectedL4Id, setSelectedL4Id] = useState<string | null>(null);
  const [l3ViewMode, setL3ViewMode] = useState<"cards" | "table">("cards");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

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
            system_actions: Array.isArray(t.system_actions) ? t.system_actions : [],
          }))
        : seed.transactions,
      data_models: Array.isArray((base as any).data_models) ? (base as any).data_models : [],
    };
  });

  const [createPersonaOpen, setCreatePersonaOpen] = useState(false);

  const [createPersonaDraft, setCreatePersonaDraft] = useState({
    display_name: "",
    description: "",
    persona_type: "Human" as PersonaType,
    avatar_id: "" as string,
  });

  const [createSystemOpen, setCreateSystemOpen] = useState(false);

  const [createSystemDraft, setCreateSystemDraft] = useState<SystemModel>({
    system_id: "",
    name: "",
    category: "Other",
    modules: [],
    description: "",
    owner: "",
    status: "Active",
  });

  const [newModule, setNewModule] = useState("");

  const [architectureView, setArchitectureView] = useState<"home" | "detail">("home");
  const [selectedSystemId, setSelectedSystemId] = useState<string>(seed.systems[0]?.system_id || "");

  const [systemModuleInput, setSystemModuleInput] = useState("");
  const [envName, setEnvName] = useState("");
  const [envUrl, setEnvUrl] = useState("");

  const [roleType, setRoleType] = useState<SystemRoleType>("RBPRole");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [personaView, setPersonaView] = useState<"home" | "detail">("home");

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarSearch, setAvatarSearch] = useState("");

  const [selectedPersonaId, setSelectedPersonaId] = useState(seed.personas?.[0]?.persona_id ?? "");
  const [selectedTransactionId, setSelectedTransactionId] = useState(seed.transactions[0].transaction_id);
  // ================================================
  // END - Main Component State
  // ================================================

  // ================================================
  // START - Derived Data & Computed Values
  // ================================================
  const personasById = useMemo(() => {
    const m = new Map<string, Persona>();
    (data.personas ?? []).forEach((p: Persona) => m.set(p.persona_id, p));
    return m;
  }, [data.personas]);

  const selectedPersona = personasById.get(selectedPersonaId);

  const selectedTransaction = useMemo(() => {
    return (data.transactions ?? []).find((t: Transaction) => t.transaction_id === selectedTransactionId);
  }, [data.transactions, selectedTransactionId]);

  const personaOptions = data.personas.map((p) => ({ value: p.persona_id, label: p.display_name }));
  const trxOptions = data.transactions.map((t) => ({ value: t.transaction_id, label: t.name }));
  const systemOptions = (data.systems ?? []).map((s: SystemModel) => ({ value: s.name, label: s.name }));
  // ================================================
  // END - Derived Data & Computed Values
  // ================================================

  // ================================================
  // START - Helper Functions (CRUD, etc.)
  // ================================================
  function createPersonaFromModal() {
    const name = createPersonaDraft.display_name.trim();
    if (!name) return;

    const newId = `PER-${String((data.personas?.length ?? 0) + 1).padStart(6, "0")}`;

    const persona: Persona = {
      persona_id: newId,
      persona_type: createPersonaDraft.persona_type,
      display_name: name,
      description: createPersonaDraft.description.trim(),
      status: "Active",
      version: "1.0",
      roles: [],
      capabilities: [],
      system_mappings: [],
      avatar_id: createPersonaDraft.avatar_id || AVATAR_BANK[0]?.avatar_id || "",
    };

    setData((d) => ({ ...d, personas: [persona, ...(d.personas ?? [])] }));
    setSelectedPersonaId(newId);
    setPersonaView("detail");
    setCreatePersonaOpen(false);
  }

  function openCreatePersona() {
    setCreatePersonaDraft({
      display_name: "",
      description: "",
      persona_type: "Human" as PersonaType,
      avatar_id: AVATAR_BANK[0]?.avatar_id ?? "",
    });
    setCreatePersonaOpen(true);
  }

  function closeCreatePersona() {
    setCreatePersonaOpen(false);
  }

  function getAvatarForPersona(persona?: Persona) {
    if (!persona?.avatar_id) return undefined;
    return AVATAR_BANK.find(a => a.avatar_id === persona.avatar_id);
  }

  function updateSystem(systemId: string, updater: (s: SystemModel) => SystemModel) {
    setData((d) => ({
      ...d,
      systems: (d.systems ?? []).map((s: SystemModel) =>
        s.system_id === systemId ? updater(s) : s
      ),
    }));
  }

  function updateTransaction(updater: (t: Transaction) => Transaction) {
    setData((d) => ({
      ...d,
      transactions: d.transactions.map((t) => (t.transaction_id === selectedTransactionId ? updater(t) : t)),
    }));
  }

  function resetAllData() {
    setData(seed);
    localStorage.removeItem(STORAGE_KEY);
  }

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

    setLinkTargetId("");
    setLinkLabel("");
    setLinkCondition("");
    setLinkType("mandatory");
    setLinkDirection("next");
  }

  function removeTransactionLink(linkId: string) {
    setData((d: any) => ({
      ...d,
      transaction_links: (d.transaction_links ?? []).filter((x: TransactionLink) => x.id !== linkId),
    }));
  }

  function normalizeSteps(steps: Step[]) {
    return (steps ?? []).map((s, i) => ({
      ...s,
      id: `S${i + 1}`,
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
      data_model_ref: stepDraft.type === "data" ? (stepDraft.data_model_ref.trim() || undefined) : undefined,
      required_fields:
        stepDraft.type === "data"
          ? stepDraft.required_fields_csv
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
    };

    updateTransaction((t) => ({
      ...t,
      steps: normalizeSteps([...(t.steps ?? []), nextStep]),
    }));

    setStepDraft({
      type: "navigation",
      action: "",
      ui_hint: "",
      data_model_ref: "",
      required_fields_csv: "",
    });
  }

  function openEditStep(step: Step) {
    setEditStepId(step.id);
    setStepDraft({
      type: step.type,
      action: step.action || "",
      ui_hint: step.ui_hint || "",
      data_model_ref: step.data_model_ref || "",
      required_fields_csv: (step.required_fields ?? []).join(", "),
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
          data_model_ref: stepDraft.type === "data" ? (stepDraft.data_model_ref.trim() || undefined) : undefined,
          required_fields:
            stepDraft.type === "data"
              ? stepDraft.required_fields_csv
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              : undefined,
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
      required_fields_csv: "",
    });
  }

  function deleteStep(stepId: string) {
    updateTransaction((t) => ({
      ...t,
      steps: normalizeSteps((t.steps ?? []).filter((s) => s.id !== stepId)),
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
      condition: actionDraft.trigger === "conditional" ? (actionDraft.condition.trim() || undefined) : undefined,
    };

    updateTransaction((t) => ({
      ...t,
      system_actions: normalizeActions([...(t.system_actions ?? []), nextAction]),
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
      target: a.target || "",
      description: a.description || "",
      condition: a.condition || "",
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
          condition: actionDraft.trigger === "conditional" ? (actionDraft.condition.trim() || undefined) : undefined,
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
      condition: "",
    });
  }

  function deleteSystemAction(actionId: string) {
    updateTransaction((t) => ({
      ...t,
      system_actions: normalizeActions((t.system_actions ?? []).filter((a) => a.id !== actionId)),
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
      entity: en,
    };

    updateTransaction((t) => ({
      ...t,
      emitted_events: [...(t.emitted_events ?? []), newEvent],
    }));

    setEventDraft({ event_type: "", when: "On Save", entity: "" });
  }

  function openEditEmittedEvent(idx: number) {
    const e = (selectedTransaction.emitted_events ?? [])[idx];
    if (!e) return;

    setEditEventIndex(idx);
    setEventDraft({
      event_type: e.event_type || "",
      when: e.when || "On Save",
      entity: e.entity || "",
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
        entity: en,
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
      emitted_events: (t.emitted_events ?? []).filter((_, i) => i !== idx),
    }));
  }

  const [run, setRun] = useState<RunState>(() => ({
    run_id: `RUN-${uid()}`,
    started_at: new Date().toISOString(),
    persona_id: selectedPersonaId,
    transaction_id: selectedTransactionId,
    step_index: 0,
    completed_steps: {},
    evidence: {},
  }));

  function resetRun() {
    setRun({
      run_id: `RUN-${uid()}`,
      started_at: new Date().toISOString(),
      persona_id: selectedPersonaId,
      transaction_id: selectedTransactionId,
      step_index: 0,
      completed_steps: {},
      evidence: {},
    });
  }

  const runPersona = personasById.get(run.persona_id);
  const runTransaction = data.transactions.find((t) => t.transaction_id === run.transaction_id);
  const currentStep = runTransaction?.steps?.[run.step_index];

  function nextStep() {
    if (!runTransaction) return;
    setRun((r) => ({
      ...r,
      step_index: Math.min(r.step_index + 1, Math.max(0, runTransaction.steps.length - 1)),
    }));
  }

  function prevStep() {
    setRun((r) => ({
      ...r,
      step_index: Math.max(r.step_index - 1, 0),
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
          ...patch,
        },
      },
    }));
  }

  function exportRunJSON() {
    const payload = {
      ...run,
      persona: runPersona,
      transaction: runTransaction,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert("Copied run JSON to clipboard ✅");
  }

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
    // ... (all L3 nodes exactly as in your file)
  ];

  const L4_PROCESS_NODES: ProcessNode[] = [
    // ... (all L4 nodes exactly as in your file)
  ];

  function getLinkedProcessStepsForTransaction(trxId: string) {
    const l4Nodes = (data as any).l4_process_nodes ?? L4_PROCESS_NODES;
    const linkedL4 = l4Nodes.filter((n: any) => (n.transactionIds ?? []).includes(trxId));

    return linkedL4
      .map((l4) => {
        const l3 = L3_PROCESS_NODES.find((x) => x.id === l4.parentId);
        const l2 = l3 ? (L2_PROCESS_AREAS as any).find((x: any) => x.id === l3.parentId) : undefined;

        const breadcrumbTitles = [l2?.title, l3?.title, l4.title].filter(Boolean) as string[];
        const breadcrumbIds = [l2?.id, l3?.id, l4.id].filter(Boolean) as string[];

        return {
          l2,
          l3,
          l4,
          breadcrumbTitles,
          breadcrumbIds,
          breadcrumbText: breadcrumbTitles.join(" > "),
        };
      })
      .filter((x) => x.breadcrumbTitles.length > 0);
  }

  function buildTransactionTableRows() {
    const personasByIdLocal = new Map((data.personas ?? []).map((p: Persona) => [p.persona_id, p]));
    const rows = (data.transactions ?? []).map((t: Transaction) => {
      const linked = getLinkedProcessStepsForTransaction(t.transaction_id);
      const primary = linked[0];

      const l2Title = primary?.l2?.title ?? "";
      const l3Title = primary?.l3?.title ?? "";
      const l4Title = primary?.l4?.title ?? "";
      const processPathText = primary?.breadcrumbText ?? "";

      const system = (t.system_context ?? [])[0] ?? "";
      const personaNames = (t.performed_by_personas ?? [])
        .map((id) => personasByIdLocal.get(id)?.display_name)
        .filter(Boolean) as string[];

      return {
        id: t.transaction_id,
        name: t.name,
        status: t.status,
        system,
        l2: l2Title,
        l3: l3Title,
        l4: l4Title,
        processPathText,
        personaIds: t.performed_by_personas ?? [],
        personaNames,
        personaCount: personaNames.length,
        stepsCount: (t.steps ?? []).length,
        actionsCount: (t.system_actions ?? []).length,
        eventsCount: (t.emitted_events ?? []).length,
        raw: t,
      };
    });

    return rows;
  }

  function openProcessStepFromTransaction(l4Id: string) {
    if (!l4Id) return;
    setProcessesDeepLinkL4Id(l4Id);
    setTab("processes");
  }
  // ================================================
  // END - Helper Functions (CRUD, etc.)
  // ================================================

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

  // ================================================
// START - Render / JSX
// ================================================

return (
  <div style={{ padding: 16, background: "#f7f7f7", minHeight: "100vh", fontFamily: "system-ui, Arial" }}>
    
  <div
    style={{
      display: "grid",
      gridTemplateColumns: sidebarCollapsed ? "88px 1fr" : "280px 1fr",
      gap: 14,
      alignItems: "start",
    }}
  >

      {/* Left navigation */}
      
    {/* ================================================ */}
    {/* START - Sidebar Render */}
    {/* ================================================ */}
    <ResponsiveSidebar
      tab={tab}
      setTab={setTab}
      logoSrc={psLogo}
      onCollapseChange={setSidebarCollapsed}
      onNewRun={() => {
        setTab("run");
        resetRun();
      }}
      onResetData={() => {
        const ok = window.confirm("Reset everything back to the default seed data?");
        if (ok) resetAllData();
      }}
      clearSelectedTransaction={() => setSelectedTransactionId("")}
    />
    {/* ================================================ */}
    {/* END - Sidebar Render */}
    {/* ================================================ */}

      {/* Main panel */}
      <div style={{ display: "grid", gap: 14 }}>

        {/* ================================================ */}
        {/* START - Home Tab */}
        {/* ================================================ */}
        {tab === "home" && (
          <Panel title="Welcome">
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Welcome to Process Stack</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                This is your landing page. Later we’ll add pagelets / jump points into Personas, Transactions, Runs, and Media.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "white" }}>
                  <div style={{ fontWeight: 700 }}>Jump points (coming soon)</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                    Add shortcuts like “Create Persona”, “Start Run”, “Open Transaction Library”, etc.
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}
        {/* ================================================ */}
        {/* END - Home Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Processes Tab */}
        {/* ================================================ */}
        {tab === "processes" && (
          <ProcessesTab
            data={data}
            setData={setData}
            setTab={setTab}
            setSelectedTransactionId={setSelectedTransactionId}
            setTransactionsInitialView={setTransactionsInitialView}
            Panel={Panel}
            Button={Button}
            Select={Select}
            Input={Input}
            Textarea={Textarea}
            ProcessesL2Accordion={ProcessesL2Accordion}
            deepLinkL4Id={processesDeepLinkL4Id}
            clearDeepLinkL4Id={() => setProcessesDeepLinkL4Id("")}
          />
        )}
        {/* ================================================ */}
        {/* END - Processes Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Data Models Tab */}
        {/* ================================================ */}
        {tab === "dataModels" && (
          <DataModelsTab
            data={data}
            setData={setData}
            Panel={Panel}
            Button={Button}
            Input={Input}
            Textarea={Textarea}
            Select={Select}
          />
        )}
        {/* ================================================ */}
        {/* END - Data Models Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Architecture Tab */}
        {/* ================================================ */}


                {tab === "architecture" && (
                      <ArchitectureTab
                        data={data}
                        setData={setData}
                        Panel={Panel}
                        Button={Button}
                        Input={Input}
                        Textarea={Textarea}
                        Select={Select}
                      />
                    )}

       {/* ================================================ */}
        {/* END - Architecture Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Personas Tab */}
        {/* ================================================ */}
        {tab === "personas" && (
          <Panel title="Personas">
            <AvatarPickerModal
              open={avatarPickerOpen}
              onClose={() => {
                setAvatarPickerOpen(false);
                setAvatarSearch("");
              }}
              selectedAvatarId={
                createPersonaOpen
                  ? createPersonaDraft.avatar_id
                  : selectedPersona?.avatar_id
              }
              search={avatarSearch}
              setSearch={setAvatarSearch}
              onSelect={(avatarId) => {
                if (createPersonaOpen) {
                  setCreatePersonaDraft((d) => ({ ...d, avatar_id: avatarId }));
                } else if (selectedPersona) {
                  setData((d) => ({
                    ...d,
                    personas: d.personas.map((p) =>
                      p.persona_id === selectedPersona.persona_id
                        ? { ...p, avatar_id: avatarId }
                        : p
                    ),
                  }));
                }
                setAvatarPickerOpen(false);
                setAvatarSearch("");
              }}
            />
            {personaView === "home" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Personas across all processes</div>
                  <Button variant="secondary" onClick={openCreatePersona}>
                    + Add Persona
                  </Button>
                </div>
                <CreatePersonaModal
                  open={createPersonaOpen}
                  onClose={closeCreatePersona}
                  draft={createPersonaDraft}
                  setDraft={setCreatePersonaDraft}
                  onCreate={createPersonaFromModal}
                  onChooseAvatar={() => {
                    setAvatarSearch("");
                    setAvatarPickerOpen(true);
                  }}
                  avatarSummary={
                    createPersonaDraft.avatar_id
                      ? (() => {
                          const a = AVATAR_BANK.find((x) => x.avatar_id === createPersonaDraft.avatar_id);
                          return a ? `${a.name} — ${a.outfit}` : "Avatar selected";
                        })()
                      : "Default will be used if you don’t pick one"
                  }
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                  {data.personas
                    .filter((p) => p.status === "Active")
                    .map((p) => {
                      const av = getAvatarForPersona(p);
                      return (
                        <div
                          key={p.persona_id}
                          onClick={() => {
                            setSelectedPersonaId(p.persona_id);
                            setPersonaView("detail");
                          }}
                          style={{
                            cursor: "pointer",
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: 12,
                            background: "white",
                            display: "grid",
                            gap: 10,
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{p.display_name}</div>
                          <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8, minHeight: 140 }}>
                            {av ? (
                              <img src={av.image_url} alt={`${av.name} - ${av.outfit}`} style={{ width: "100%", display: "block" }} />
                            ) : (
                              <div style={{ color: "#6b7280", fontSize: 12, padding: 10 }}>No avatar assigned</div>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {p.persona_id} • {p.persona_type}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <Button variant="secondary" onClick={() => setPersonaView("home")}>
                    ← Back to Personas
                  </Button>
                </div>
                {!selectedPersona ? (
                  <div style={{ color: "#6b7280" }}>No persona selected.</div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Panel title="Synthesia Avatar">
                        {(() => {
                          const av = getAvatarForPersona(selectedPersona);
                          return (
                            <div style={{ display: "grid", gap: 10 }}>
                              <div style={{ background: "#f3f4f6", borderRadius: 12, overflow: "hidden", padding: 8 }}>
                                {av ? (
                                  <img src={av.image_url} alt={`${av.name} - ${av.outfit}`} style={{ width: "100%", display: "block" }} />
                                ) : (
                                  <div style={{ color: "#6b7280", fontSize: 12, padding: 10 }}>No avatar assigned</div>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                {av ? `${av.name} — ${av.outfit}` : "Choose an avatar from the bank"}
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setAvatarPickerOpen(false);
                                  setAvatarSearch("");
                                  setTimeout(() => setAvatarPickerOpen(true), 0);
                                }}
                              >
                                Change avatar
                              </Button>
                            </div>
                          );
                        })()}
                      </Panel>
                      <Panel title="Profile">
                        <div style={{ fontWeight: 800, fontSize: 18 }}>{selectedPersona.display_name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {selectedPersona.persona_id} • {selectedPersona.persona_type} • v{selectedPersona.version} • {selectedPersona.status}
                        </div>
                        <div style={{ height: 8 }} />
                        <Textarea
                          value={selectedPersona.description}
                          onChange={(v) =>
                            setData((d) => ({
                              ...d,
                              personas: d.personas.map((p) =>
                                p.persona_id === selectedPersona.persona_id ? { ...p, description: v } : p
                              ),
                            }))
                          }
                        />
                        <div style={{ height: 8 }} />
                        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedPersona, null, 2))}>
                          Copy Persona JSON
                        </Button>
                      </Panel>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Panel title="Systems & Roles">
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>System mappings</div>
                        {selectedPersona.system_mappings.length === 0 ? (
                          <div style={{ color: "#6b7280", fontSize: 12 }}>No system mappings yet.</div>
                        ) : (
                          <div style={{ display: "grid", gap: 8 }}>
                            {selectedPersona.system_mappings.map((m, idx) => (
                              <div
                                key={idx}
                                style={{
                                  border: "1px solid #eee",
                                  borderRadius: 12,
                                  padding: 10,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 10,
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700 }}>{m.system}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    {m.role_type}: {m.role_name}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    setData((d) => ({
                                      ...d,
                                      personas: d.personas.map((p) =>
                                        p.persona_id === selectedPersona.persona_id
                                          ? { ...p, system_mappings: p.system_mappings.filter((_, i) => i !== idx) }
                                          : p
                                      ),
                                    }))
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Panel>
                      <Panel title="Transactions">
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Transactions available</div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {data.transactions.map((t) => {
                            const allowed = t.performed_by_personas.includes(selectedPersona.persona_id);
                            return (
                              <div
                                key={t.transaction_id}
                                style={{
                                  border: "1px solid #eee",
                                  borderRadius: 12,
                                  padding: 10,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 10,
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>{t.process_path.join(" > ")}</div>
                                </div>
                                <Checkbox
                                  checked={allowed}
                                  onChange={(on) => {
                                    setData((d) => ({
                                      ...d,
                                      transactions: d.transactions.map((x) =>
                                        x.transaction_id !== t.transaction_id
                                          ? x
                                          : {
                                              ...x,
                                              performed_by_personas: on
                                                ? Array.from(new Set([...x.performed_by_personas, selectedPersona.persona_id]))
                                                : x.performed_by_personas.filter((id) => id !== selectedPersona.persona_id),
                                            }
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    </div>
                  </>
                )}
              </div>
            )}
          </Panel>
        )}
        {/* ================================================ */}
        {/* END - Personas Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Transactions Tab */}
        {/* ================================================ */}
        {tab === "transactions" && (
          <TransactionsTab
            data={data}
            setData={setData}
            selectedTransactionId={selectedTransactionId}
            setSelectedTransactionId={setSelectedTransactionId}
            trxOptions={trxOptions}
            personaOptions={personaOptions}
            systemOptions={systemOptions}
            getLinkedProcessStepsForTransaction={getLinkedProcessStepsForTransaction}
            Panel={Panel}
            Button={Button}
            Input={Input}
            Textarea={Textarea}
            Select={Select}
            initialView={transactionsInitialView}
            onOpenProcessStep={openProcessStepFromTransaction}
            updateTransaction={updateTransaction}
            getAvatarForPersona={getAvatarForPersona}
          />
        )}
        {/* ================================================ */}
        {/* END - Transactions Tab */}
        {/* ================================================ */}

        {/* ================================================ */}
        {/* START - Run Tab */}
        {/* ================================================ */}
        {tab === "run" && (
          <Panel title="Run / Evidence">
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Panel title="Context">
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Persona</div>
                  <Select value={run.persona_id} onChange={(v) => setRun((r) => ({ ...r, persona_id: v }))} options={personaOptions} />
                  <div style={{ height: 10 }} />
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Transaction</div>
                  <Select
                    value={run.transaction_id}
                    onChange={(v) => setRun((r) => ({ ...r, transaction_id: v, step_index: 0, completed_steps: {}, evidence: {} }))}
                    options={trxOptions}
                  />
                  <div style={{ height: 10 }} />
                  <Button variant="secondary" onClick={resetRun}>
                    New run
                  </Button>
                  <div style={{ height: 8 }} />
                  <Button onClick={exportRunJSON}>Copy run JSON</Button>
                </Panel>
                <Panel title="Step">
                  {!runTransaction || !currentStep ? (
                    <div style={{ color: "#6b7280" }}>No steps for this transaction.</div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 6 }}>
                        <span style={badgeStyle(currentStep.type)}>{currentStep.type.toUpperCase()}</span>
                        <strong>{currentStep.action}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{currentStep.ui_hint || ""}</div>
                      {currentStep.type === "data" && (
                        <div style={{ marginTop: 10, fontSize: 12 }}>
                          <div style={{ color: "#6b7280" }}>
                            Data model: <span style={{ fontFamily: "monospace" }}>{currentStep.data_model_ref || "(none)"}</span>
                          </div>
                          <div style={{ color: "#6b7280" }}>
                            Required fields: {currentStep.required_fields?.join(", ") || "(none)"}
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <Button variant="secondary" onClick={prevStep} disabled={run.step_index === 0}>
                          Prev
                        </Button>
                        <Button variant="secondary" onClick={nextStep} disabled={run.step_index >= (runTransaction.steps.length - 1)}>
                          Next
                        </Button>
                      </div>
                    </>
                  )}
                </Panel>
                <Panel title="Evidence">
                  {!currentStep ? (
                    <div style={{ color: "#6b7280" }}>Select a transaction with steps.</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Notes</div>
                      <Textarea
                        value={(run.evidence[currentStep.id]?.notes) || ""}
                        onChange={(v) => updateEvidence(currentStep.id, { notes: v })}
                        placeholder="What happened? Any exceptions?"
                      />
                      <div style={{ height: 10 }} />
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Observed fields (for data steps)</div>
                      {currentStep.type !== "data" ? (
                        <div style={{ color: "#6b7280", fontSize: 12 }}>This is a navigation step. Evidence is usually notes only.</div>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              const existing = run.evidence[currentStep.id]?.observedFields || [];
                              updateEvidence(currentStep.id, {
                                observedFields: [
                                  ...existing,
                                  { label: "", type: "string", required: false, allowedValues: "" },
                                ],
                              });
                            }}
                          >
                            Add field
                          </Button>
                          <div style={{ height: 8 }} />
                          {(run.evidence[currentStep.id]?.observedFields || []).length === 0 ? (
                            <div style={{ color: "#6b7280", fontSize: 12 }}>No fields captured yet.</div>
                          ) : (
                            <div style={{ display: "grid", gap: 8 }}>
                              {(run.evidence[currentStep.id]?.observedFields || []).map((f, idx) => (
                                <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: 8, alignItems: "center" }}>
                                    <Input
                                      value={f.label}
                                      onChange={(v) => {
                                        const list = [...(run.evidence[currentStep.id]?.observedFields || [])];
                                        list[idx] = { ...list[idx], label: v };
                                        updateEvidence(currentStep.id, { observedFields: list });
                                      }}
                                      placeholder="Field label"
                                    />
                                    <select
                                      value={f.type}
                                      onChange={(e) => {
                                        const list = [...(run.evidence[currentStep.id]?.observedFields || [])];
                                        list[idx] = { ...list[idx], type: e.target.value };
                                        updateEvidence(currentStep.id, { observedFields: list });
                                      }}
                                      style={{ padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
                                    >
                                      {["string", "number", "boolean", "date", "enum", "object"].map((t) => (
                                        <option key={t} value={t}>
                                          {t}
                                        </option>
                                      ))}
                                    </select>
                                    <Input
                                      value={f.allowedValues}
                                      onChange={(v) => {
                                        const list = [...(run.evidence[currentStep.id]?.observedFields || [])];
                                        list[idx] = { ...list[idx], allowedValues: v };
                                        updateEvidence(currentStep.id, { observedFields: list });
                                      }}
                                      placeholder="Allowed values (comma)"
                                    />
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                      <Checkbox
                                        checked={f.required}
                                        onChange={(on) => {
                                          const list = [...(run.evidence[currentStep.id]?.observedFields || [])];
                                          list[idx] = { ...list[idx], required: on };
                                          updateEvidence(currentStep.id, { observedFields: list });
                                        }}
                                      />
                                      <span style={{ fontSize: 12 }}>Required</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      onClick={() => {
                                        const list = [...(run.evidence[currentStep.id]?.observedFields || [])];
                                        list.splice(idx, 1);
                                        updateEvidence(currentStep.id, { observedFields: list });
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Panel>
              </div>
            </div>
          </Panel>
        )}
        {/* ================================================ */}
        {/* END - Run Tab */}
        {/* ================================================ */}

      </div>
    </div>
  </div>
);
// ================================================
// END - Render / JSX
// ================================================
}