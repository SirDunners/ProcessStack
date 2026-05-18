import type { ProcessNode } from "../utils/domain";

export const L2_PROCESS_AREAS = [
  {
    id: "L2-HR",
    title: "Human Resources",
    description: "Recruitment, onboarding, position management, and workforce changes.",
    imageUrl: "https://images.unsplash.com/photo-1644132246573-bc75ce0a2946?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-FIN",
    title: "Finance",
    description: "Procure-to-pay, record-to-report, invoicing, approvals, and controls.",
    imageUrl: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-IT",
    title: "IT & Access",
    description: "Joiners/movers/leavers, identity, permissions, and device provisioning.",
    imageUrl: "https://images.unsplash.com/photo-1683322499436-f4383dd59f5a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "L2-OPS",
    title: "Operations",
    description: "Service delivery, case handling, and operational workflows.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1721936482448-1400b30b3c00?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

export const L3_PROCESS_NODES: ProcessNode[] = [
  // paste your full L3 list here
];

export const L4_PROCESS_NODES: ProcessNode[] = [
  // paste your full L4 list here
];
