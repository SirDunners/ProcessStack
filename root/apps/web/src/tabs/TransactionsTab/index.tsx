import React from "react";
import { useProcessStackState } from "../../state/useProcessStackState";
import TransactionList from "./TransactionList";
import TransactionDetail from "./TransactionDetail";

export default function TransactionsTab() {
  const {
    data,
    setData,
    selectedTransactionId,
    setSelectedTransactionId,
    trxOptions,
    personaOptions,
    systemOptions,
    getLinkedProcessStepsForTransaction,
    onOpenProcessStep,
    getAvatarForPersona,
    updateTransaction,
  } = useProcessStackState();

  const selected = data.transactions?.find(
    (t) => t.transaction_id === selectedTransactionId
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!selectedTransactionId ? (
        <TransactionList />
      ) : (
        <TransactionDetail transaction={selected} />
      )}
    </div>
  );
}
