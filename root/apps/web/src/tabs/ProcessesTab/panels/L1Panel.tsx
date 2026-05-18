import React, { useState, useMemo } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";
import ChildrenPanel from "./ChildrenPanel";
import RollupPanel from "./RollupPanel";

export default function L1Panel() {
  const { data, setData, Panel, Input, Textarea, Button, setSelectedProcessNodeId } =
    useProcessStackState();

  const [editingOrg, setEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState(data.organisation?.name ?? "Organisation");
  const [orgDesc, setOrgDesc] = useState(data.organisation?.description ?? "");

  const l2s = data.l2_process_areas ?? [];

  const rollup = useMemo(() => {
    const l3s = data.l3_process_nodes ?? [];
    const l4s = data.l4_process_nodes ?? [];
    const trx = data.transactions ?? [];
    const systems = data.systems ?? [];
    const integrations = data.integrations ?? [];
    const personas = data.personas ?? [];

    return {
      l2Count: l2s.length,
      l3Count: l3s.length,
      l4Count: l4s.length,
      trxCount: trx.length,
      systemCount: systems.length,
      integrationCount: integrations.length,
      personaCount: personas.length,
    };
  }, [data, l2s]);

  const saveOrg = () => {
    setData((d: any) => ({
      ...d,
      organisation: {
        ...(d.organisation ?? {}),
        name: orgName.trim() || "Organisation",
        description: orgDesc.trim(),
      },
    }));
    setEditingOrg(false);
  };

  const addL2 = () => {
    const id = `L2-${Math.random().toString(16).slice(2, 8)}`;
    setData((d: any) => ({
      ...d,
      l2_process_areas: [
        ...(d.l2_process_areas ?? []),
        {
          id,
          title: "New Process Area",
          description: "",
        },
      ],
    }));
    setSelectedProcessNodeId(id);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Panel title="Organisation">
        {!editingOrg ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{orgName}</div>
            {orgDesc ? <div style={{ fontSize: 13, color: "#6b7280" }}>{orgDesc}</div> : null}
            <Button variant="secondary" onClick={() => setEditingOrg(true)}>
              Edit organisation
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Name</div>
              <Input value={orgName} onChange={setOrgName} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Description</div>
              <Textarea value={orgDesc} onChange={setOrgDesc} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" onClick={() => setEditingOrg(false)}>
                Cancel
              </Button>
              <Button onClick={saveOrg}>Save</Button>
            </div>
          </div>
        )}
      </Panel>

      <RollupPanel
        title="Organisation roll‑ups"
        summary={`${rollup.l2Count} L2 • ${rollup.l3Count} L3 • ${rollup.l4Count} L4 • ${rollup.trxCount} transactions • ${rollup.systemCount} systems • ${rollup.integrationCount} integrations • ${rollup.personaCount} personas`}
      >
        <div style={{ fontSize: 12, color: "#6b7280", display: "grid", gap: 4 }}>
          <div>L2 process areas: {rollup.l2Count}</div>
          <div>L3 subprocesses: {rollup.l3Count}</div>
          <div>L4 steps: {rollup.l4Count}</div>
          <div>Transactions: {rollup.trxCount}</div>
          <div>Systems: {rollup.systemCount}</div>
          <div>Integrations: {rollup.integrationCount}</div>
          <div>Personas: {rollup.personaCount}</div>
        </div>
      </RollupPanel>

      <Button onClick={addL2}>+ Add L2 process area</Button>

      <ChildrenPanel title="L2 Process Areas" childrenNodes={l2s} level="l2" />
    </div>
  );
}
