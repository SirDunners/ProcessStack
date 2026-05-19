import type { PacksConfig, LoadedPack, PackManifest } from "./packTypes";

async function loadPacksConfig(): Promise<PacksConfig> {
  const url = new URL(`./packs.json`, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Packs config not found`);
  }
  return response.json();
}

async function loadPackManifest(packName: string): Promise<PackManifest> {
  const url = new URL(`./${packName}/pack.json`, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pack not found: ${packName}`);
  }
  return response.json();
}

export async function loadPacks(): Promise<LoadedPack[]> {
  const config = await loadPacksConfig();

  const manifests = await Promise.all(
    config.packs.map((packName) => loadPackManifest(packName))
  );

  return manifests.map((manifest) => ({
    manifest,
  }));
}
