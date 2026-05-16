import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export type L2ProcessArea = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export default function ProcessesL2Accordion({
  areas,
  onOpen,
}: {
  areas: readonly L2ProcessArea[];
  onOpen: (area: L2ProcessArea) => void;
}) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleSelect = (index: number) => {
    if (index === expandedIndex) onOpen(areas[index]);
    else setExpandedIndex(index);
  };

  return (
    <div className="w-full h-[360px] md:h-[420px]">
      <LayoutGroup>
        <div className="flex w-full h-full gap-2">
          {areas.map((item, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                key={item.id}
                layout
                initial={false}
                onMouseEnter={() => setExpandedIndex(index)}
                onClick={() => handleSelect(index)}
                className="relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
                animate={{ flex: isExpanded ? 3 : 1 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelect(index);
                }}
              >
                <motion.img
                  src={item.imageUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{
                    scale: isExpanded ? 1.0 : 1.05,
                    filter: isExpanded ? "brightness(0.9)" : "brightness(0.6)",
                  }}
                  transition={{ duration: 0.35 }}
                />

<motion.div
  className="absolute inset-0 z-20 p-5 text-white text-left flex flex-col items-start justify-start"
  layout="position"
  initial={false}
>
  {/* Top gradient for readability (works for both expanded & collapsed) */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-transparent z-[-1]" />

  <motion.h3
    layout="position"
    className="font-semibold"
    animate={{ fontSize: isExpanded ? "1.4rem" : "1.1rem" }}
    transition={{ duration: 0.2 }}
  >
    {item.title}
  </motion.h3>

  <AnimatePresence initial={false} mode="wait">
    {isExpanded && (
      <motion.p
        key="desc"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
        className="text-sm leading-snug mt-2 max-w-[44ch]"
      >
        {item.description}
      </motion.p>
    )}
  </AnimatePresence>
</motion.div>

              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
