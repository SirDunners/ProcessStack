import type { WorkspaceConfig } from "./workspaceTypes";

export async function loadWorkspace(workspaceId: string): Promise<WorkspaceConfig> {
  const url = new URL(`./workspace.json`, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return response.json();
}