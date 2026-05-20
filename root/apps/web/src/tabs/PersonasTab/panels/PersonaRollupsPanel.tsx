// PersonaRollupsPanel.tsx
import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaRollupsPanel({ persona }: any) {
  const { data, Panel } = useProcessStackState();

  const rollup = useMemo(() => {
    const trx = data.transactions ?? [];
    const performed = trx.filter((t: any) =>
      (t.performed_by_personas ?? []).includes(persona.persona_id)
    );

    return {
      trxCount: performed.length,
    };
  }, [data, persona.persona_id]);

  return (
    <Panel title="Usage Roll-ups">
      <div style={{ fontSize: 13, color: "#444" }}>
        Transactions performed: <strong>{rollup.trxCount}</strong>
      </div>
    </Panel>
  );
}