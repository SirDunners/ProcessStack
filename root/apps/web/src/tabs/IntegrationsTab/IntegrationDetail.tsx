import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import IntegrationBasicsPanel from "./panels/IntegrationBasicsPanel";
import IntegrationSystemsPanel from "./panels/IntegrationSystemsPanel";
import IntegrationDataModelsPanel from "./panels/IntegrationDataModelsPanel";
import IntegrationRollupsPanel from "./panels/IntegrationRollupsPanel";

export default function IntegrationDetail() {
  const {
    data,
    selectedIntegrationId,
    setSelectedIntegrationId,
    Panel,
    Button,
  } = useProcessStackState();

  const integration = useMemo(
    () =>
      (data.integrations ?? []).find(
        (i: any) => i.id === selectedIntegrationId
      ),
    [data.integrations, selectedIntegrationId]
  );

  if (!integration) {
    return (
      <Panel title="Integration">
        <div style={{ color: "#6b7280" }}>Integration not found.</div>
        <Button variant="secondary" onClick={() => setSelectedIntegrationId("")}>
          ← Back to Integrations
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <IntegrationBasicsPanel integration={integration} />
      <IntegrationSystemsPanel integration={integration} />
      <IntegrationDataModelsPanel integration={integration} />
      <IntegrationRollupsPanel integration={integration} />

      <Button variant="secondary" onClick={() => setSelectedIntegrationId("")}>
        ← Back to Integrations
      </Button>
    </div>
  );
}
