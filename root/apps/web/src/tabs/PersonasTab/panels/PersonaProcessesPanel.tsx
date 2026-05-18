import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaProcessesPanel({ persona }: any) {
  const { data, Panel } = useProcessStackState();

  const processes = useMemo(() => {
    const l4s = data.l4_process_nodes ?? [];
    const trx = data.transactions ?? [];

    const trxPerformed = trx.filter((t: any) =>
      (t.performed_by_personas ?? []).includes(persona.persona_id)
    );

    const l4Used = l4s.filter((l4: any) =>
      trxPerformed.some((t: any) =>
        (l4.transactionIds ?? []).includes(t.transaction_id)
      )
    );

    return l4Used;
  }, [data, persona.persona_id]);

  return (
    <Panel title="Processes Involved">
      {processes.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No processes linked.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {processes.map((l4: any) => (
            <div
              key={l4.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 600 }}>{l4.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{l4.id}</div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
