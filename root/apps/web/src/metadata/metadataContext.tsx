
import { createContext, useContext, useEffect, useState } from "react";
import { usePacks } from "../pack-loader";
import { mergeMetadata } from "./loadMetadata";
import type { Metadata } from "./metadataTypes";

const MetadataContext = createContext<Metadata | null>(null);

export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const packs = usePacks();
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    if (packs) {
      const merged = mergeMetadata(packs);
      setMetadata(merged);
    }
  }, [packs]);

  if (!metadata) return <div>Loading metadata…</div>;

  return (
    <MetadataContext.Provider value={metadata}>
      {children}
    </MetadataContext.Provider>
  );
}


export function useMetadata(): Metadata {
  const ctx = useContext(MetadataContext);
  if (!ctx) throw new Error("useMetadata must be used within a MetadataProvider");
  return ctx;
}


