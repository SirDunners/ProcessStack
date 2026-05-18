import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "../../ProcessesTab/panels/RollupPanel";

export default function DataModelRollupsPanel({ model }: any) {
  const { data } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const l4s = data.l4_process_nodes ?? [];
    const integrations = data.integrations ?? [];

    const trxUsingModel = trx.filter((t: any) =>
      (t.steps ?? []).some(
        (s: any) => s.type === "data" && s.data_model_ref === model.id
      )
    );

    const l4UsingModel = l4s.filter((l4: any) =>
      (l4.transactionIds ?? []).some((tid: string) =>
        trxUsingModel.some((t: any) => t.transaction_id === tid)
      )
    );

    const integrationsUsingModel = integrations.filter((i: any) =>
      (i.dataModels ?? []).includes(model.id)
    );

    return {
      trxCount: trxUsingModel.length,
      l4Count: l4UsingModel.length,
      integrationCount: integrationsUsingModel.length,
    };
  }, [data, model.id]);

  return (
    <RollupPanel
      title="Usage roll‑ups"
      summary={`${rollup.trxCount} transactions • ${rollup.l4Count} L4 steps • ${rollup.integrationCount} integrations`}
    >
      <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
        <div>Transactions using this model: {rollup.trxCount}</div>
        <div>L4 steps referencing this model: {rollup.l4Count}</div>
        <div>Integrations referencing this model: {rollup.integrationCount}</div>
      </div>
    </RollupPanel>
  );
}
