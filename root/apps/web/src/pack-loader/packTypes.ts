export interface PackManifest {
    name: string;
    version: string;
    processes?: string[];
    models?: string[];
    // extend later as needed
  }
  
  export interface LoadedPack {
    manifest: PackManifest;
    // later: processes, models, ui, etc.
  }
  
  export interface PacksConfig {
    packs: string[];
  }
  