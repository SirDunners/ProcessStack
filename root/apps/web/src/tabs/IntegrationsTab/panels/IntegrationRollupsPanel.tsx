import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "../../ProcessesTab/panels/RollupPanel";

export default function IntegrationRollupsPanel({ integration }: any) {
  const { data } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const l4s = data.l4_process_nodes ?? [];

    const trxUsingIntegration = trx.filter((t: any) =>
      (t.system_actions ?? []).some(
        (a: any) => a.target === integration.id || a.integration_id === integration.id
      )
    );

    const l4UsingIntegration = l4s.filter((l4: any) =>
      trxUsingIntegration.some((t: any) =>
        (l4.transactionIds ?? []).includes(t.transaction_id)
      )
    );

    return {
      trxCount: trxUsingIntegration.length,
      l4Count: l4UsingIntegration.length,
    };
  }, [data, integration.id]);

  return (
    <RollupPanel
      title="Usage roll‑ups"
      summary={`${rollup.trxCount} transactions • ${rollup.l4Count} L4 steps`}
    >
      <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
        <div>Transactions using this integration: {rollup.trxCount}</div>
        <div>L4 steps impacted: {rollup.l4Count}</div>
      </div>
    </RollupPanel>
  );
}
