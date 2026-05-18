import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import IntegrationList from "./IntegrationList";
import IntegrationDetail from "./IntegrationDetail";

export default function IntegrationsTab() {
  const { selectedIntegrationId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedIntegrationId ? <IntegrationList /> : <IntegrationDetail />}
    </div>
  );
}
