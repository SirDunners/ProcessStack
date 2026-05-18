import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

interface RollupPanelProps {
  title: string;
  summary: string;
  children: React.ReactNode;
}

export default function RollupPanel({ title, summary, children }: RollupPanelProps) {
  const { Panel, Button } = useProcessStackState();
  const [open, setOpen] = useState(false);

  return (
    <Panel title={title}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{summary}</div>
        <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"}
        </Button>
      </div>
      {open ? <div style={{ marginTop: 8 }}>{children}</div> : null}
    </Panel>
  );
}
