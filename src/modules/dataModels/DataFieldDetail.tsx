import React, { useMemo, useState } from "react";

/**
 * DataFieldDetail (Module)
 * - Field-level page for a Data Model field
 * - Designed for future "data journey" / lineage views
 * - MVP now:
 *    - compact header (Field ID + source code + label)
 *    - Field attributes (type/status/standard/length/order/description)
 *    - Usage section: Transactions & Steps referencing this field (passed in)
 *    - Placeholder sections for Integrations / Data Journey
 */

// ================================================
// START - Type Definitions
// ================================================
export type DataFieldUsage = {
  transaction_id: string;
  transaction_name: string;
  step_id?: string;
  step_action?: string;
  step_type?: string;
  model_ref?: string;
};

export type DataFieldDetailProps = {
  model: any; // DataModel
  field: any; // DataField

  onBackToModel: () => void;
  onDeleteField?: () => void;

  // Usage data is computed in the controller (DataModelsTab) so this module stays pure.
  usedInTransactions?: DataFieldUsage[];

  // Optional deep-links
  onOpenTransaction?: (transaction_id: string) => void;

  // UI primitives
  Panel: React.ComponentType<{ title: React.ReactNode; children: React.ReactNode }>;
  Button: React.ComponentType<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
};
// ================================================
// END - Type Definitions
// ================================================

// ================================================
// START - Helper Functions
// ================================================
function displayModelName(m: any) {
  return `${m.system} > ${m.entity}`;
}
// ================================================
// END - Helper Functions
// ================================================

export default function DataFieldDetail(props: DataFieldDetailProps) {
  const {
    model,
    field,
    onBackToModel,
    onDeleteField,
    usedInTransactions = [],
    onOpenTransaction,
    Panel,
    Button,
  } = props;

  // ================================================
  // START - Local State
  // ================================================
  const [hoveredTrxId, setHoveredTrxId] = useState<string>("");
  // ================================================
  // END - Local State
  // ================================================

  // ================================================
  // START - Computed Data
  // ================================================
  const usage = useMemo(() => {
    return [...(usedInTransactions ?? [])].sort((a, b) => {
      const an = String(a.transaction_name ?? "");
      const bn = String(b.transaction_name ?? "");
      const c = an.localeCompare(bn);
      if (c !== 0) return c;
      return String(a.step_id ?? "").localeCompare(String(b.step_id ?? ""));
    });
  }, [usedInTransactions]);
  // ================================================
  // END - Computed Data
  // ================================================

  return (
    <Panel title="Data Models">
      <div style={{ display: "grid", gap: 12 }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={onBackToModel}>
            ← Back to {displayModelName(model)}
          </Button>

          {onDeleteField ? (
            <Button variant="ghost" onClick={onDeleteField}>
              Delete Field
            </Button>
          ) : null}
        </div>

        {/* ===================== FIELD SUMMARY (START) ===================== */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "white",
            padding: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Field</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{field.field_id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Model</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>{model.model_id}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Source field code</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>
                {field.source_field_code ?? ""}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Label</div>
              <div style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>
                {field.label ?? ""}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "160px 160px 180px 120px 120px 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Type</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>{field.type ?? ""}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Status</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>{field.status ?? ""}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Standard/Custom</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>{field.standard_custom ?? ""}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Length</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>{typeof field.length === "number" ? String(field.length) : ""}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Order</div>
              <div style={{ fontFamily: "monospace", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb" }}>{typeof field.order === "number" ? String(field.order) : ""}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Description</div>
              <div style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", color: "#6b7280" }}>
                {String(field.description ?? "").trim() || "(none)"}
              </div>
            </div>
          </div>
        </div>
        {/* ===================== FIELD SUMMARY (END) ======================= */}

        {/* ===================== USAGE: TRANSACTIONS (START) =============== */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Used in Transactions</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Transactions and steps that reference this field.</div>
          </div>

          {usage.length === 0 ? (
            <div style={{ fontSize: 13, color: "#6b7280" }}>No usage found yet (we’ll populate this when DATA steps reference field IDs).</div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflowX: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "240px 1fr 90px 2fr",
                  padding: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                  minWidth: 900,
                }}
              >
                <div>Transaction</div>
                <div>Transaction ID</div>
                <div>Step</div>
                <div>Step Action</div>
              </div>

              {usage.map((u) => (
                <button
                  key={`${u.transaction_id}-${u.step_id ?? ""}`}
                  type="button"
                  onClick={() => onOpenTransaction?.(u.transaction_id)}
                  onMouseEnter={() => setHoveredTrxId(u.transaction_id)}
                  onMouseLeave={() => setHoveredTrxId("")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "white",
                    padding: 0,
                    cursor: onOpenTransaction ? "pointer" : "default",
                  }}
                  title={onOpenTransaction ? `Open ${u.transaction_id}` : ""}
                  disabled={!onOpenTransaction}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "240px 1fr 90px 2fr",
                      padding: 10,
                      borderBottom: "1px solid #f3f4f6",
                      alignItems: "center",
                      minWidth: 900,
                      fontSize: 14,
                      fontWeight: 400,
                      background: hoveredTrxId === u.transaction_id ? "#f3f4f6" : "white",
                    }}
                  >
                    <div>{u.transaction_name}</div>
                    <div style={{ fontFamily: "monospace", color: "#6b7280" }}>{u.transaction_id}</div>
                    <div style={{ fontFamily: "monospace" }}>{u.step_id ?? ""}</div>
                    <div style={{ color: "#6b7280" }}>{u.step_action ?? ""}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ===================== USAGE: TRANSACTIONS (END) ================= */}

        {/* ===================== PLACEHOLDERS (START) ====================== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Used in Integrations</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Coming soon — we’ll show inbound/outbound integrations that read/write this field.
            </div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: 16, display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Data Journey</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Coming soon — a lineage view showing where the field originates and where it is consumed.
            </div>
          </div>
        </div>
        {/* ===================== PLACEHOLDERS (END) ======================== */}
      </div>
    </Panel>
  );
}