import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "../../ProcessesTab/panels/RollupPanel";

export default function PersonaRollupsPanel({ persona }: any) {
  const { data } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const l4s = data.l4_process_nodes ?? [];
    const systems = data.systems ?? [];
    const models = data.data_models ?? [];

    const trxPerformed = trx.filter((t: any) =>
      (t.performed_by_personas ?? []).includes(persona.persona_id)
    );

    const l4Used = l4s.filter((l4: any) =>
      trxPerformed.some((t: any) =>
        (l4.transactionIds ?? []).includes(t.transaction_id)
      )
    );

    const systemsUsed = systems.filter((s: any) =>
      (persona.systems ?? []).includes(s.id)
    );

    const modelsUsed = models.filter((m: any) =>
      systemsUsed.some((s: any) => s.id === m.system)
    );

    return {
      trxCount: trxPerformed.length,
      l4Count: l4Used.length,
      systemCount: systemsUsed.length,
      modelCount: modelsUsed.length,
    };
  }, [data, persona.persona_id, persona.systems]);

  return (
    <RollupPanel
      title="Usage roll‑ups"
      summary={`${rollup.trxCount} transactions • ${rollup.l4Count} L4 steps • ${rollup.systemCount} systems • ${rollup.modelCount} data models`}
    >
      <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
        <div>Transactions performed: {rollup.trxCount}</div>
        <div>L4 steps involved: {rollup.l4Count}</div>
        <div>Systems used: {rollup.systemCount}</div>
        <div>Data models touched: {rollup.modelCount}</div>
      </div>
    </RollupPanel>
  );
}
