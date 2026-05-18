import React, { useMemo, useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import RollupPanel from "./RollupPanel";
import SortOrderPanel from "./SortOrderPanel";

interface L4PanelProps {
  node: any;
}

export default function L4Panel({ node }: L4PanelProps) {
  const { data, setData, Panel, Input, Textarea, Button } = useProcessStackState();
  const [draft, setDraft] = useState({ title: node.title ?? "", description: node.description ?? "" });

  const linkedTransactions = useMemo(() => {
    const trx = data.transactions ?? [];
    return trx.filter((t: any) => (node.transactionIds ?? []).includes(t.transaction_id));
  }, [data.transactions, node.transactionIds]);

  const save = () => {
    setData((d: any) => ({
      ...d,
      l4_process_nodes: (d.l4_process_nodes ?? []).map((x: any) =>
        x.id === node.id ? { ...x, title: draft.title.trim(), description: draft.description.trim() } : x
      ),
    }));
  };

  const addTransactionLink = (trxId: string) => {
    setData((d: any) => ({
      ...d,
      l4_process_nodes: (d.l4_process_nodes ?? []).map((x: any) =>
        x.id === node.id
          ? {
              ...x,
              transactionIds: Array.from(new Set([...(x.transactionIds ?? []), trxId])),
            }
          : x
      ),
    }));
  };

  const removeTransactionLink = (trxId: string) => {
    setData((d: any) => ({
      ...d,
      l4_process_nodes: (d.l4_process_nodes ?? []).map((x: any) =>
        x.id === node.id
          ? {
              ...x,
              transactionIds: (x.transactionIds ?? []).filter((id: string) => id !== trxId),
            }
          : x
      ),
    }));
  };

  const trxOptions =
    (data.transactions ?? []).map((t: any) => ({
      value: t.transaction_id,
      label: t.name ?? t.transaction_id,
    })) ?? [];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Panel title="L4 Step">
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Title</div>
            <Input
              value={draft.title}
              onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Description</div>
            <Textarea
              value={draft.description}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={() => setDraft({ title: node.title ?? "", description: node.description ?? "" })}>
              Reset
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Panel>

      <RollupPanel
        title="Linked transactions"
        summary={`${linkedTransactions.length} transaction(s) linked`}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Add transaction link</div>
          {/* Assuming you have a Select primitive */}
          {/* @ts-ignore */}
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              addTransactionLink(e.target.value);
              e.target.value = "";
            }}
            style={{ padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
            defaultValue=""
          >
            <option value="">Select transaction...</option>
            {trxOptions.map((o: any) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {linkedTransactions.length === 0 ? (
            <div style={{ fontSize: 12, color: "#6b7280" }}>No transactions linked yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {linkedTransactions.map((t: any) => (
                <div
                  key={t.transaction_id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "white",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name ?? t.transaction_id}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{t.transaction_id}</div>
                  </div>
                  <Button variant="ghost" onClick={() => removeTransactionLink(t.transaction_id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </RollupPanel>

      <SortOrderPanel node={node} />
    </div>
  );
}
