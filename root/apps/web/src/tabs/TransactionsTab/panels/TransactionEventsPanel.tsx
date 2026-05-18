import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function TransactionEventsPanel({ transaction }) {
  const {
    updateTransaction,
    Panel,
    Button,
    Input,
    Select,
  } = useProcessStackState();

  // all your eventDraft, editEventOpen, helpers, etc.

  return (
    <Panel title="Emitted Events">
      {/* full JSX exactly as in your GOLD file */}
    </Panel>
  );
}
