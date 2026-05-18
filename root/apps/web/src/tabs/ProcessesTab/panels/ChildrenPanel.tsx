import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

interface ChildrenPanelProps {
  title: string;
  childrenNodes: any[];
  level: "l2" | "l3" | "l4";
}

export default function ChildrenPanel({ title, childrenNodes, level }: ChildrenPanelProps) {
  const { Panel, Button, setSelectedProcessNodeId } = useProcessStackState();

  return (
    <Panel title={title}>
      {childrenNodes.length === 0 ? (
        <div style={{ color: "#6b7280", fontSize: 12 }}>No children defined yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {childrenNodes.map((n) => (
            <div
              key={n.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                background: "white",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{n.title}</div>
                {n.description ? (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{n.description}</div>
                ) : null}
              </div>
              <Button variant="secondary" onClick={() => setSelectedProcessNodeId(n.id)}>
                Open
              </Button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
