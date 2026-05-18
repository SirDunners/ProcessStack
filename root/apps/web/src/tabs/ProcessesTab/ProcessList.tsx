import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import L1Panel from "./panels/L1Panel";

export default function ProcessList() {
  const { Panel } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Panel title="Processes">
        <L1Panel />
      </Panel>
    </div>
  );
}
