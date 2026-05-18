import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function TransactionActionsPanel({ transaction }) {
  const {
    updateTransaction,
    Panel,
    Button,
    Input,
    Select,
  } = useProcessStackState();

  // all your actionDraft, editActionOpen, helpers, etc.

  return (
    <Panel title="System Actions">
      {/* full JSX exactly as in your GOLD file */}
    </Panel>
  );
}
