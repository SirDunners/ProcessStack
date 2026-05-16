import React, { useMemo, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosSearch } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { GoPerson } from "react-icons/go";
import { IoNewspaperOutline, IoSettingsOutline } from "react-icons/io5";
import { MdAccountTree, MdOutlineArchitecture,MdStorage } from "react-icons/md";

type TabKey = "home" | "processes" | "architecture" | "transactions" | "personas" | "run";

export default function ResponsiveSidebar({
  tab,
  setTab,
  onNewRun,
  onResetData,
  logoSrc,
  onCollapseChange,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  onNewRun: () => void;
  onResetData: () => void;
  logoSrc?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  

  const menu = useMemo(
    () => [
      { key: "home" as const, label: "Home", icon: <RxDashboard className="text-[1.3rem]" /> },

      { key: "processes" as const, label: "Processes", icon: <MdAccountTree className="text-[1.3rem]" /> },
      { key: "architecture" as const, label: "Architecture", icon: <MdOutlineArchitecture className="text-[1.3rem]" /> },
      { key: "dataModels" as const, label: "Data Models", icon: <MdStorage className="text-[1.3rem]" /> },
      { key: "transactions" as const, label: "Transactions", icon: <IoNewspaperOutline className="text-[1.3rem]" /> },
      { key: "personas" as const, label: "Personas", icon: <GoPerson className="text-[1.3rem]" /> },
      { key: "run" as const, label: "Run / Evidence", icon: <IoSettingsOutline className="text-[1.3rem]" /> },
    ],
    []
  );

  // Same logo rendering for expanded + collapsed (cropped/zoomed to remove PNG whitespace)
  const LogoBadge = () => (
    <div
      className="h-9 w-9 rounded-md bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={() => setTab("home")}
      title="Home"
    >
      {logoSrc ? (
        <img src={logoSrc} alt="Process Stack" className="h-full w-full object-cover scale-125" />
      ) : (
        <span className="font-bold text-gray-700 dark:text-slate-200">PS</span>
      )}
    </div>
  );

  return (
    <aside
      className={[
        "bg-white dark:bg-slate-900 rounded-md transition-all duration-300 relative",
        "shadow-md shadow-gray-200/60 dark:shadow-slate-900/40",
      ].join(" ")}
    >
      {/* Header */}
      <div className={`mt-3 ${isExpanded ? "px-4" : "px-2"} transition-all duration-300 ease-in-out`}>
        {isExpanded ? (
          <div className="flex items-center justify-between min-h-[40px]">
            <div className="flex items-center gap-3">
              <LogoBadge />
              

              <div className="cursor-pointer select-none flex-shrink-0" onClick={() => setTab("home")}>
  <div className="text-[1rem] font-[500] text-gray-700 dark:text-slate-100 whitespace-nowrap">
    Process Stack
  </div>
</div>


            </div>


          </div>
        ) : (
          <div className="flex justify-center">
            <LogoBadge />
          </div>
        )}

        {/* search bar */}
        {isExpanded ? (
          <div className="relative mt-4">
            <input
              className="px-4 py-2 dark:border-slate-700 dark:bg-transparent dark:text-[#abc2d3] dark:placeholder:text-slate-500 border border-gray-200 rounded-md w-full pl-[40px] outline-none focus:border-[#3B9DF8]"
              placeholder="Search..."
            />
            <IoIosSearch className="absolute top-[9px] left-2 text-[1.5rem] text-[#adadad]" />
          </div>
        ) : (
          <div className="w-full relative group mt-2 flex justify-center">
            <IoIosSearch className="text-[2rem] text-gray-500 dark:text-[#abc2d3] p-[5px] rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/50 cursor-pointer" />
          </div>
        )}
      </div>




{/* collapse button */}


{/* TOGGLE (forced visible) */}
<div
  style={{
    position: "absolute",
    top: 40,
    right: -15,
    zIndex: 9999,
  }}
>
  <button
    type="button"
    aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
    onClick={() => {
      setIsExpanded((prev) => {
        const next = !prev;
        onCollapseChange?.(!next);
        return next;
      });
    }}

    style={{
      height: 32,
      width: 34,
      borderRadius: 10,
      background: "rgba(229, 231, 235, 0.95)", // softer grey
      border: "1px solid rgba(209, 213, 219, 1)",
      boxShadow: "0 6px 18px rgba(0,0,0,0.10)", // softer “floating” feel
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
    
  >
    <span
      style={{
        display: "inline-block",
        fontSize: 18,
        color: "#374151",
        transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
        transition: "transform 200ms",
        userSelect: "none",
      }}
    >
      ❮
    </span>
  </button>
</div>




      {/* main section */}
      <div className={`mt-6 ${isExpanded ? "px-4" : "px-2"} transition-all duration-300 ease-in-out`}>


        <div className="mt-3 flex flex-col gap-[5px]">
          {menu.map((item) => {
            const active = tab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setTab(item.key)}
                className={[
                  "flex items-center w-full p-[8px] rounded-md cursor-pointer transition-all duration-200 relative group",
                  isExpanded ? "justify-between" : "justify-center",
                  active ? "bg-gray-100 dark:bg-slate-800/70" : "hover:bg-gray-50 dark:hover:bg-slate-800/50",
                ].join(" ")}
              >
                <div className="flex items-center gap-[10px] text-gray-500 dark:text-[#abc2d3]">
                  {item.icon}
                  <p className={`${isExpanded ? "inline" : "hidden"} text-[1rem] font-[400] whitespace-nowrap`}>
                    {item.label}
                  </p>
                </div>

                {!isExpanded && (
                  <div className="absolute top-0 right-[-140px] translate-x-[20px] opacity-0 z-[-1] group-hover:translate-x-0 group-hover:opacity-100 group-hover:z-[1] transition-all duration-500">
                    <p className="text-[0.9rem] w-max bg-gray-600 dark:bg-slate-800 text-white dark:text-[#abc2d3] rounded px-3 py-[5px]">
                      {item.label}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* actions */}
      <div className={`mt-6 ${isExpanded ? "px-4" : "px-2"} transition-all duration-300 ease-in-out`}>
        <p className={`${isExpanded ? "text-start" : "text-center"} text-[0.9rem] text-gray-500 dark:text-[#abc2d3]`}>
          Actions
        </p>

        <div className="mt-3 flex flex-col gap-[8px]">
          <button onClick={onNewRun} className="w-full bg-gray-900 text-white rounded-md py-2 hover:bg-gray-800 transition">
            {isExpanded ? "New Run" : "➕"}
          </button>

          <button
            onClick={onResetData}
            className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-[#abc2d3] rounded-md py-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {isExpanded ? "Reset data" : "↺"}
          </button>
        </div>
      </div>



{/* bottom spacer */}
<div className="mt-6 border-t border-gray-200 dark:border-slate-800" />
<div className="h-6" />


    </aside>
  );
}