import type { WorkspaceConfig } from "./workspaceTypes";

export async function loadWorkspace(workspaceId: string): Promise<WorkspaceConfig> {
  const response = await fetch(`/workspaces/${workspaceId}/workspace.json`);
  if (!response.ok) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return response.json();
}
