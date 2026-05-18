import { createContext, useContext, useEffect, useState } from "react";
import { loadWorkspace } from "./loadWorkspace";
import type { WorkspaceConfig } from "./workspaceTypes";

const WorkspaceContext = createContext<WorkspaceConfig | null>(null);

export function WorkspaceProvider({ workspaceId, children }) {
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);

  useEffect(() => {
    loadWorkspace(workspaceId).then(setWorkspace);
  }, [workspaceId]);

  if (!workspace) return <div>Loading workspace…</div>;

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
