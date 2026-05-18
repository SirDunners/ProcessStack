import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import DataModelList from "./DataModelList";
import DataModelDetail from "./DataModelDetail";

export default function DataModelsTab() {
  const { selectedDataModelId } = useProcessStackState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedDataModelId ? <DataModelList /> : <DataModelDetail />}
    </div>
  );
}
