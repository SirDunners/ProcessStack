import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function TransactionStepsPanel({ transaction }) {
  const {
    setSelectedTransactionId,
    onOpenProcessStep,
    getLinkedProcessStepsForTransaction,
    updateTransaction,
    data,
    Panel,
    Button,
    Input,
    Textarea,
    Select,
  } = useProcessStackState();

  if (!transaction) {
    return (
      <Panel title="Steps">
        <div style={{ padding: 20, color: "#6b7280" }}>No transaction selected.</div>
      </Panel>
    );
  }

  const selectedTransaction = transaction;
  const selectedTransactionId = transaction.transaction_id;

  const linkedSteps = getLinkedProcessStepsForTransaction(selectedTransactionId);

  const trxOptions = data.transactions.map((t: any) => ({
    value: t.transaction_id,
    label: t.name,
  }));

  const systemOptions = data.systems.map((s: any) => ({
    value: s.system_id,
    label: s.name,
  }));

  return (
    <Panel title="Steps">
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Select transaction</div>
          <Select
            value={selectedTransactionId}
            onChange={setSelectedTransactionId}
            options={trxOptions}
          />
        </div>

        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Panel title="Basics">
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Name</div>
                <Input
                  value={selectedTransaction.name}
                  onChange={(v) =>
                    updateTransaction((t: any) => ({ ...t, name: v }))
                  }
                />
              </div>

              {/* ⭐ UPDATED PROCESS STEP BLOCK */}
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  Process Step
                </div>

                {(() => {
                  // Primary: linked L4 steps
                  if (linkedSteps.length > 0) {
                    return (
                      <div style={{ display: "grid", gap: 6 }}>
                        <Button
                          variant="secondary"
                          disabled={!linkedSteps[0]?.l4?.id || !onOpenProcessStep}
                          onClick={() => {
                            const l4Id = linkedSteps[0]?.l4?.id;
                            if (l4Id) onOpenProcessStep?.(l4Id);
                          }}
                        >
                          {linkedSteps[0]?.breadcrumbText ?? "Open Process Step"}
                        </Button>

                        {linkedSteps.length > 1 && (
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            Also linked to:{" "}
                            {linkedSteps.slice(1).map((x: any, idx: number) => (
                              <span key={x?.l4?.id ?? idx}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const l4Id = x?.l4?.id;
                                    if (l4Id) onOpenProcessStep?.(l4Id);
                                  }}
                                  disabled={!x?.l4?.id || !onOpenProcessStep}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    margin: 0,
                                    cursor:
                                      x?.l4?.id && onOpenProcessStep
                                        ? "pointer"
                                        : "default",
                                    textDecoration:
                                      x?.l4?.id && onOpenProcessStep
                                        ? "underline"
                                        : "none",
                                    color:
                                      x?.l4?.id && onOpenProcessStep
                                        ? "#111827"
                                        : "#6b7280",
                                    fontSize: 12,
                                  }}
                                  title={
                                    x?.l4?.id
                                      ? "Open this process step"
                                      : "No linked L4 step"
                                  }
                                >
                                  {x?.breadcrumbText}
                                </button>
                                {idx <
                                linkedSteps.slice(1).length - 1
                                  ? " | "
                                  : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Fallback: process_path
                  const path = selectedTransaction.process_path;
                  if (Array.isArray(path) && path.length > 0) {
                    return (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#111827",
                          fontWeight: 500,
                        }}
                      >
                        {path.join(" > ")}
                      </div>
                    );
                  }

                  // Final fallback
                  return (
                    <div style={{ fontSize: 13, color: "#9ca3af" }}>
                      Not linked to a Level 4 step yet. Link it from Processes
                      (L4 → Transactions).
                    </div>
                  );
                })()}
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  System context
                </div>
                <Select
                  value={selectedTransaction.system_context?.[0] ?? ""}
                  onChange={(v) =>
                    updateTransaction((t: any) => ({
                      ...t,
                      system_context: v ? [v] : [],
                    }))
                  }
                  options={[
                    { value: "", label: "Select system..." },
                    ...systemOptions,
                  ]}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                  Intent
                </div>
                <Textarea
                  value={selectedTransaction.intent}
                  onChange={(v) =>
                    updateTransaction((t: any) => ({ ...t, intent: v }))
                  }
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </Panel>
  );
}
