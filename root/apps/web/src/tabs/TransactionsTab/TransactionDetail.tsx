import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import TransactionStepsPanel from "./panels/TransactionStepsPanel";
import TransactionActionsPanel from "./panels/TransactionActionsPanel";
import TransactionEventsPanel from "./panels/TransactionEventsPanel";
import TransactionLinksPanel from "./panels/TransactionLinksPanel";

export default function TransactionDetail({ transaction }) {
  const {
    setSelectedTransactionId,
    onOpenProcessStep,
    getLinkedProcessStepsForTransaction,
    getAvatarForPersona,
    updateTransaction,
    Panel,
    Button,
    Input,
    Textarea,
    Select,
    data,
  } = useProcessStackState();

  if (!transaction) {
    return <div style={{ padding: 40, color: "#6b7280" }}>No transaction selected.</div>;
  }

  const linkedSteps = getLinkedProcessStepsForTransaction(transaction.transaction_id);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Basics panel */}
      {/* Persona panel */}
      {/* These two are rendered inline here, exactly as in your GOLD code */}

      <TransactionStepsPanel transaction={transaction} />

      <TransactionActionsPanel transaction={transaction} />

      <TransactionEventsPanel transaction={transaction} />

      <TransactionLinksPanel transaction={transaction} />

      <Button
        variant="secondary"
        onClick={() => {
          setSelectedTransactionId("");
        }}
      >
        ← Back to Transactions List
      </Button>
    </div>
  );
}
