import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

interface SortOrderPanelProps {
  node: any; // L4 node
}

export default function SortOrderPanel({ node }: SortOrderPanelProps) {
  const { Panel, Button, setData } = useProcessStackState();

  const move = (direction: "up" | "down") => {
    setData((d: any) => {
      const nodes = [...(d.l4_process_nodes ?? [])];
      const idx = nodes.findIndex((n) => n.id === node.id);
      if (idx === -1) return d;

      const siblings = nodes.filter((n) => n.parent_l3_id === node.parent_l3_id);
      const ordered = siblings.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const sIdx = ordered.findIndex((n) => n.id === node.id);
      if (sIdx === -1) return d;

      const targetIdx = direction === "up" ? sIdx - 1 : sIdx + 1;
      if (targetIdx < 0 || targetIdx >= ordered.length) return d;

      const tmp = ordered[sIdx].sort_order ?? sIdx;
      ordered[sIdx].sort_order = ordered[targetIdx].sort_order ?? targetIdx;
      ordered[targetIdx].sort_order = tmp;

      const updated = nodes.map((n) => {
        const changed = ordered.find((o) => o.id === n.id);
        return changed ?? n;
      });

      return { ...d, l4_process_nodes: updated };
    });
  };

  return (
    <Panel title="Sort order">
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Control the order of L4 steps within this L3.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="secondary" onClick={() => move("up")}>
          Move up
        </Button>
        <Button variant="secondary" onClick={() => move("down")}>
          Move down
        </Button>
      </div>
    </Panel>
  );
}
