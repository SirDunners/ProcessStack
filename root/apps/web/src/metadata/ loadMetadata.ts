import type { Metadata } from "./metadataTypes";
import type { LoadedPack } from "../pack-loader";

export function mergeMetadata(packs: LoadedPack[]): Metadata {
  const metadata: Metadata = {
    processes: {},
    models: {}
  };

  for (const pack of packs) {
    const m = pack.manifest;

    // Merge processes
    if (m.processes) {
      for (const p of m.processes) {
        metadata.processes[p.id] = p;
      }
    }

    // Merge models
    if (m.models) {
      for (const model of m.models) {
        metadata.models[model.id] = model;
      }
    }
  }

  return metadata;
}
