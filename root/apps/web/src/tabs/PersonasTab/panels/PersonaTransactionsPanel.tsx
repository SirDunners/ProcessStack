import React, { useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function PersonaTransactionsPanel({ persona }: any) {
  const { data, Panel } = useProcessStackState();

  const transactions = useMemo(() => {
    return (data.transactions ?? []).filter((t: any) =>
      (t.performed_by_personas ?? []).includes(persona.persona_id)
    );
  }, [data.transactions, persona.persona_id]);

  return (
    <Panel title="Transactions Performed">
      {transactions.length === 0 ? (
        <div style={{ color: "#6b7280" }}>No transactions linked.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {transactions.map((t: any) => (
            <div
              key={t.transaction_id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {t.transaction_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
