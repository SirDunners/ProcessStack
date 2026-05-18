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


export type { 
    SystemCategory,
    SupportInfo,
    SystemEnvironment,
    SystemRoleType,
    SystemRole,
    SystemModel,
    ProcessLevel,
    ProcessNode,
    PersonaType,
    StepType,
    SystemMapping,
    Persona,
    Step,
    EmittedEvent,
    SystemActionType,
    SystemActionTrigger,
    SystemAction,
    LinkType,
    TransactionLink,
    Transaction,
    RunState
  };