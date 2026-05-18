import React from "react";
import { Panel, Checkbox } from "../../components/ui-primitives";
import { useProcessStackState } from "../../state/useProcessStackState";

export default function PersonaTransactionsPanel({ persona }) {
  const { data, setData } = useProcessStackState();

  return (
    <Panel title="Transactions">
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Transactions available
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {data.transactions.map((t) => {
          const allowed = t.performed_by_personas.includes(persona.persona_id);

          return (
            <div
              key={t.transaction_id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 10,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {t.process_path.join(" > ")}
                </div>
              </div>

              <Checkbox
                checked={allowed}
                onChange={(on) => {
                  setData((d) => ({
                    ...d,
                    transactions: d.transactions.map((x) =>
                      x.transaction_id !== t.transaction_id
                        ? x
                        : {
                            ...x,
                            performed_by_personas: on
                              ? Array.from(
                                  new Set([
                                    ...x.performed_by_personas,
                                    persona.persona_id,
                                  ])
                                )
                              : x.performed_by_personas.filter(
                                  (id) => id !== persona.persona_id
                                ),
                          }
                    ),
                  }));
                }}
              />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
