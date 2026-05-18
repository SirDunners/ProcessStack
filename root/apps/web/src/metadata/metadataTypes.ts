export interface ProcessDefinition {
    id: string;
    name: string;
    steps: any[]; // refine later
  }
  
  export interface DataModelDefinition {
    id: string;
    fields: Record<string, any>;
  }
  
  export interface Metadata {
    processes: Record<string, ProcessDefinition>;
    models: Record<string, DataModelDefinition>;
  }
  