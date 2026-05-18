import { createContext, useContext, useEffect, useState } from "react";
import { loadPacks } from "./loadPacks";
import type { LoadedPack } from "./packTypes";

const PackContext = createContext<LoadedPack[] | null>(null);

export function PackProvider({ workspaceId, children }) {
  const [packs, setPacks] = useState<LoadedPack[] | null>(null);

  useEffect(() => {
    loadPacks(workspaceId).then(setPacks);
  }, [workspaceId]);

  if (!packs) {
    return <div>Loading packs…</div>;
  }

  return (
    <PackContext.Provider value={packs}>
      {children}
    </PackContext.Provider>
  );
}

export function usePacks() {
  return useContext(PackContext);
}
