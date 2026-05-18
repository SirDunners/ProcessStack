import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "../../ProcessesTab/panels/RollupPanel";

export default function ArchitectureRollupsPanel({ item }: any) {
  const { data } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const l4s = data.l4_process_nodes ?? [];
    const dataModels = data.data_models ?? [];

    const trxUsingSystems = trx.filter((t: any) =>
      (t.system_context ?? []).some((sid: string) =>
        (item.systems ?? []).includes(sid)
      )
    );

    const l4UsingSystems = l4s.filter((l4: any) =>
      trxUsingSystems.some((t: any) =>
        (l4.transactionIds ?? []).includes(t.transaction_id)
      )
    );

    const modelsOwned = dataModels.filter((m: any) =>
      (item.systems ?? []).includes(m.system)
    );

    return {
      trxCount: trxUsingSystems.length,
      l4Count: l4UsingSystems.length,
      modelCount: modelsOwned.length,
    };
  }, [data, item.systems]);

  return (
    <RollupPanel
      title="Usage roll‑ups"
      summary={`${rollup.trxCount} transactions • ${rollup.l4Count} L4 steps • ${rollup.modelCount} data models`}
    >
      <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
        <div>Transactions impacted: {rollup.trxCount}</div>
        <div>L4 steps impacted: {rollup.l4Count}</div>
        <div>Data models owned: {rollup.modelCount}</div>
      </div>
    </RollupPanel>
  );
}
