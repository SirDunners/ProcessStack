import React, { useMemo, useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import ChildrenPanel from "./ChildrenPanel";
import RollupPanel from "./RollupPanel";

interface L2PanelProps {
  node: any;
}

export default function L2Panel({ node }: L2PanelProps) {
  const { data, setData, Panel, Input, Textarea, Button } = useProcessStackState();
  const [draft, setDraft] = useState({ title: node.title ?? "", description: node.description ?? "" });

  const l3s = useMemo(
    () => (data.l3_process_nodes ?? []).filter((n: any) => n.parent_l2_id === node.id),
    [data.l3_process_nodes, node.id]
  );

  const rollup = useMemo(() => {
    const l4s = (data.l4_process_nodes ?? []).filter((n: any) =>
      l3s.some((p: any) => p.id === n.parent_l3_id)
    );
    const trx = data.transactions ?? [];
    const systems = data.systems ?? [];
    const integrations = data.integrations ?? [];
    const personas = data.personas ?? [];

    const trxLinked = trx.filter((t: any) =>
      l4s.some((l4: any) => (l4.transactionIds ?? []).includes(t.transaction_id))
    );

    return {
      l3Count: l3s.length,
      l4Count: l4s.length,
      trxCount: trxLinked.length,
      systemCount: systems.length, // refine later if you want true usage
      integrationCount: integrations.length,
      personaCount: personas.length,
    };
  }, [data, l3s]);

  const save = () => {
    setData((d: any) => ({
      ...d,
      l2_process_areas: (d.l2_process_areas ?? []).map((x: any) =>
        x.id === node.id ? { ...x, title: draft.title.trim(), description: draft.description.trim() } : x
      ),
    }));
  };

  const addL3 = () => {
    const id = `L3-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      l3_process_nodes: [
        ...(d.l3_process_nodes ?? []),
        {
          id,
          parent_l2_id: node.id,
          title: "New Sub‑Process",
          description: "",
        },
      ],
    }));
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Panel title="L2 Process Area">
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
        title="L2 roll‑ups"
        summary={`${rollup.l3Count} L3 • ${rollup.l4Count} L4 • ${rollup.trxCount} transactions`}
      >
        <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
          <div>Sub‑processes (L3): {rollup.l3Count}</div>
          <div>Steps (L4): {rollup.l4Count}</div>
          <div>Transactions: {rollup.trxCount}</div>
          <div>Systems (approx): {rollup.systemCount}</div>
          <div>Integrations (approx): {rollup.integrationCount}</div>
          <div>Personas (approx): {rollup.personaCount}</div>
        </div>
      </RollupPanel>

      <Button onClick={addL3}>+ Add L3 sub‑process</Button>

      <ChildrenPanel title="L3 Sub‑Processes" childrenNodes={l3s} level="l3" />
    </div>
  );
}
