import type {
    Persona,
    Transaction,
    SystemModel,
    TransactionLink
  } from "../utils/domain";
  
  export const seed: {
    personas: Persona[];
    transactions: Transaction[];
    systems: SystemModel[];
    transaction_links: TransactionLink[];
  } = {
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
        system_mappings: [
          { system: "SuccessFactors", role_type: "RBPRole", role_name: "HR Administrator" }
        ]
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
        system_mappings: [
          { system: "SuccessFactors", role_type: "DynamicRole", role_name: "Manager (Hierarchy)" }
        ]
      }
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
            required_fields: [
              "positionTitle",
              "company",
              "department",
              "jobCode",
              "effectiveStartDate"
            ]
          },
          { id: "S8", type: "navigation", action: "Save", ui_hint: "Save button" }
        ],
        emitted_events: [
          { event_type: "PositionCreated", when: "On Save", entity: "Position" }
        ],
        system_actions: []
      }
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
          notes: ""
        },
        environments: [
          { name: "Prod", url: "", notes: "" },
          { name: "Test", url: "", notes: "" }
        ],
        roles: [
          { role_type: "RBPRole", role_name: "HR Administrator", description: "" },
          { role_type: "DynamicRole", role_name: "Manager (Hierarchy)", description: "" }
        ]
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
          notes: ""
        },
        environments: [
          { name: "Prod", url: "", notes: "" },
          { name: "Test", url: "", notes: "" }
        ],
        roles: []
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
          notes: ""
        },
        environments: [
          { name: "Prod", url: "", notes: "" },
          { name: "UAT", url: "", notes: "" }
        ],
        roles: []
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
          notes: ""
        },
        environments: [
          { name: "Prod", url: "", notes: "" },
          { name: "Test", url: "", notes: "" }
        ],
        roles: []
      }
    ],
  
    transaction_links: []
  };
  