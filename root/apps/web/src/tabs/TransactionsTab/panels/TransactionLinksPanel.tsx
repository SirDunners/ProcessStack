import React from "react";
import { useProcessStackState } from "../../../state/useProcessStackState";

export default function TransactionLinksPanel({ transaction }) {
  const {
    data,
    setData,
    trxOptions,
    setSelectedTransactionId,
    Panel,
    Button,
    Input,
    Select,
  } = useProcessStackState();

  // all your linkDirection, linkTargetId, linkType, helpers, etc.

  return (
    <Panel title="Flow Links">
      {/* full JSX exactly as in your GOLD file */}
    </Panel>
  );
}
