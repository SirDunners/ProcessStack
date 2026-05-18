import type { Persona, Transaction } from "../utils/domain";
import { L2_PROCESS_AREAS, L3_PROCESS_NODES, L4_PROCESS_NODES } from "../metadata/processNodes";

export function getLinkedProcessStepsForTransaction(data: any, trxId: string) {
  const l4Nodes = data.l4_process_nodes ?? L4_PROCESS_NODES;
  const linkedL4 = l4Nodes.filter((n: any) => (n.transactionIds ?? []).includes(trxId));

  return linkedL4
    .map((l4) => {
      const l3 = L3_PROCESS_NODES.find((x) => x.id === l4.parentId);
      const l2 = l3 ? L2_PROCESS_AREAS.find((x) => x.id === l3.parentId) : undefined;

      const breadcrumbTitles = [l2?.title, l3?.title, l4.title].filter(Boolean) as string[];
      const breadcrumbIds = [l2?.id, l3?.id, l4.id].filter(Boolean) as string[];

      return {
        l2,
        l3,
        l4,
        breadcrumbTitles,
        breadcrumbIds,
        breadcrumbText: breadcrumbTitles.join(" > "),
      };
    })
    .filter((x) => x.breadcrumbTitles.length > 0);
}

export function buildTransactionTableRows(data: any) {
  const personasById = new Map((data.personas ?? []).map((p: Persona) => [p.persona_id, p]));

  return (data.transactions ?? []).map((t: Transaction) => {
    const linked = getLinkedProcessStepsForTransaction(data, t.transaction_id);
    const primary = linked[0];

    const l2Title = primary?.l2?.title ?? "";
    const l3Title = primary?.l3?.title ?? "";
    const l4Title = primary?.l4?.title ?? "";
    const processPathText = primary?.breadcrumbText ?? "";

    const system = (t.system_context ?? [])[0] ?? "";
    const personaNames = (t.performed_by_personas ?? [])
      .map((id) => personasById.get(id)?.display_name)
      .filter(Boolean) as string[];

    return {
      id: t.transaction_id,
      name: t.name,
      status: t.status,
      system,
      l2: l2Title,
      l3: l3Title,
      l4: l4Title,
      processPathText,
      personaIds: t.performed_by_personas ?? [],
      personaNames,
      personaCount: personaNames.length,
      stepsCount: (t.steps ?? []).length,
      actionsCount: (t.system_actions ?? []).length,
      eventsCount: (t.emitted_events ?? []).length,
      raw: t,
    };
  });
}
