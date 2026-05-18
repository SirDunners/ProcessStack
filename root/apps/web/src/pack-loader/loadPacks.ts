import type { PacksConfig, LoadedPack, PackManifest } from "./packTypes";

async function loadPacksConfig(workspaceId: string): Promise<PacksConfig> {
  const response = await fetch(`/workspaces/${workspaceId}/packs.json`);
  if (!response.ok) {
    throw new Error(`Packs config not found for workspace: ${workspaceId}`);
  }
  return response.json();
}

async function loadPackManifest(packName: string): Promise<PackManifest> {
  const response = await fetch(`/packages/packs/${packName}/pack.json`);
  if (!response.ok) {
    throw new Error(`Pack not found: ${packName}`);
  }
  return response.json();
}

export async function loadPacks(workspaceId: string): Promise<LoadedPack[]> {
  const config = await loadPacksConfig(workspaceId);

  const manifests = await Promise.all(
    config.packs.map((packName) => loadPackManifest(packName))
  );

  return manifests.map((manifest) => ({
    manifest,
  }));
}
