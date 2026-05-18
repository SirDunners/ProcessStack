import React, { useState } from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function TransactionStepsPanel({ transaction }) {
  const {
    updateTransaction,
    data,
    Panel,
    Button,
    Input,
    Select,
  } = useProcessStackState();

  // all your stepDraft, editStepOpen, editStepId, helpers, etc.
  // extracted 1:1 from your GOLD code

  return (
    <Panel title="Steps">
      {/* full JSX exactly as in your GOLD file */}
    </Panel>
  );
}
