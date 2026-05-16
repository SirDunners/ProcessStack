import React, { useEffect, useMemo, useRef, useState } from "react";
import TransactionsList from "./TransactionsList";
import TransactionDetail from "./TransactionDetail";

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
  

  const [view, setView] = useState<"list" | "detail">("list");
  const autoOpenedRef = useRef(false);

  const selectedTransaction = useMemo(() => {
    return (data.transactions ?? []).find((t: any) => t.transaction_id === selectedTransactionId);
  }, [data.transactions, selectedTransactionId]);

  
  // If we navigated here from another tab (e.g., Processes) with a transaction already selected,
  // jump straight to detail view.

    useEffect(() => {
      // Auto-open detail only once on first entry to Transactions
      if (autoOpenedRef.current) return;
    
      if (selectedTransactionId) {
        setView("detail");
        autoOpenedRef.current = true;
      }
    }, [selectedTransactionId]);
  


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
            setView("detail");
          }}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>

          <Button variant="secondary" onClick={() => setView("list")}>
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
          />

        </div>
      )}
    </Panel>
  );
}
