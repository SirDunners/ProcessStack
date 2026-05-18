import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "../../ProcessesTab/panels/RollupPanel";

export default function SystemRollupsPanel({ system }: any) {
  const { data } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const dataModels = data.data_models ?? [];
    const l4s = data.l4_process_nodes ?? [];

    const trxUsingSystem = trx.filter((t: any) =>
      (t.system_context ?? []).includes(system.id)
    );

    const modelsOwned = dataModels.filter((m: any) => m.system === system.id);

    const l4UsingSystem = l4s.filter((l4: any) =>
      trxUsingSystem.some((t: any) =>
        (l4.transactionIds ?? []).includes(t.transaction_id)
      )
    );

    return {
      trxCount: trxUsingSystem.length,
      modelCount: modelsOwned.length,
      l4Count: l4UsingSystem.length,
    };
  }, [data, system.id]);

  return (
    <RollupPanel
      title="Usage roll‑ups"
      summary={`${rollup.trxCount} transactions • ${rollup.modelCount} data models • ${rollup.l4Count} L4 steps`}
    >
      <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
        <div>Transactions using this system: {rollup.trxCount}</div>
        <div>Data models owned: {rollup.modelCount}</div>
        <div>L4 steps referencing this system: {rollup.l4Count}</div>
      </div>
    </RollupPanel>
  );
}
