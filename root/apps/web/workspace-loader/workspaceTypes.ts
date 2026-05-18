export interface WorkspaceConfig {
    name: string;
    packs: string[];
    theme?: string;
    features?: Record<string, boolean>;
  }
  