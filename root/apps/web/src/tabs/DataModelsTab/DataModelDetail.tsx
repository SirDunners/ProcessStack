import React, { useMemo } from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import DataModelBasicsPanel from "./panels/DataModelBasicsPanel";
import DataModelFieldsPanel from "./panels/DataModelFieldsPanel";
import DataModelRollupsPanel from "./panels/DataModelRollupsPanel";

export default function DataModelDetail() {
  const {
    data,
    selectedDataModelId,
    setSelectedDataModelId,
    Panel,
    Button,
  } = useProcessStackState();

  const model = useMemo(
    () => (data.data_models ?? []).find((m: any) => m.id === selectedDataModelId),
    [data.data_models, selectedDataModelId]
  );

  if (!model) {
    return (
      <Panel title="Data Model">
        <div style={{ color: "#6b7280" }}>Data model not found.</div>
        <Button variant="secondary" onClick={() => setSelectedDataModelId("")}>
          ← Back to Data Models
        </Button>
      </Panel>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DataModelBasicsPanel model={model} />
      <DataModelFieldsPanel model={model} />
      <DataModelRollupsPanel model={model} />

      <Button variant="secondary" onClick={() => setSelectedDataModelId("")}>
        ← Back to Data Models
      </Button>
    </div>
  );
}
