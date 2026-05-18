import React, { useEffect, useMemo, useState } from "react";
import TransactionsList from "./TransactionsList";
import TransactionDetail from "./TransactionDetail";

// ================================================
// START - Type Definitions
// ================================================
export type TransactionsTabProps = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  

  selectedTransactionId: string;
  setSelectedTransactionId: (id: string) => void;

  trxOptions: { value: string; label: string }[];
  personaOptions: { value: string; label: string }[];
  systemOptions: { value: string; label: string }[];

  getLinkedProcessStepsForTransaction: (trxId: string) => any[];
  onOpenProcessStep?: (l4Id: string) => void;

  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  Input: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Textarea: React.ComponentType<{ value: string; onChange: (v: string) => void; placeholder?: string }>;
  Select: React.ComponentType<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }>;
  getAvatarForPersona?: (persona: any) => any;
  updateTransaction: (updater: (t: any) => any) => void;
};
// ================================================
// END - Type Definitions
// ================================================

export default function TransactionsTab(props: TransactionsTabProps) {

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
    Panel,
    Button,
    Input,
    Textarea,
    Select,
    updateTransaction,
  } = props;
  
  // ================================================
  // START - Local State
  // ================================================
  const [view, setView] = useState<"list" | "detail">("list");
  
  // ================================================
  // END - Local State
  // ================================================

  // ================================================
  // START - Computed Data
  // ================================================
  const selectedTransaction = useMemo(() => {
    return (data.transactions ?? []).find((t: any) => t.transaction_id === selectedTransactionId);
  }, [data.transactions, selectedTransactionId]);
  // ================================================
  // END - Computed Data
  // ================================================

  // ================================================
  // START - Effects
  // ================================================
  // Sync view to selectedTransactionId (single source of truth)
  useEffect(() => {
    if (selectedTransactionId) {
      setView("detail");
    } else {
      setView("list");
    }
  }, [selectedTransactionId]);
  // ================================================
  // END - Effects
  // ================================================

  return (
    <Panel title="Transactions">
      {view === "list" ? (
        <TransactionsList
          data={data}
          setData={setData}
          personaOptions={personaOptions}
          systemOptions={systemOptions}
          getLinkedProcessStepsForTransaction={getLinkedProcessStepsForTransaction}
          Panel={Panel}
          Button={Button}
          Input={Input}
          Textarea={Textarea}
          Select={Select}
          onOpenTransaction={(trxId) => {
            setSelectedTransactionId(trxId);
          }}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>

          <Button 
            variant="secondary" 
            onClick={() => {
              setSelectedTransactionId("");   // clears ID → useEffect switches back to list
            }}
          >
          {"<- Back to Transactions"}
          </Button>

            <div />
          </div>


          <TransactionDetail
            data={data}
            setData={setData}
            selectedTransactionId={selectedTransactionId}
            setSelectedTransactionId={setSelectedTransactionId}
            selectedTransaction={selectedTransaction}
            trxOptions={trxOptions}
            personaOptions={personaOptions}
            systemOptions={systemOptions}
            getLinkedProcessStepsForTransaction={getLinkedProcessStepsForTransaction}
            Panel={Panel}
            Button={Button}
            Input={Input}
            Textarea={Textarea}
            Select={Select}
            updateTransaction={updateTransaction}
            onOpenProcessStep={onOpenProcessStep}
            getAvatarForPersona={getAvatarForPersona}
            onOpenTransaction={(trxId) => setSelectedTransactionId(trxId)}   // now correctly passed
          />

        </div>
      )}
    </Panel>
  );
}