// src/components/mobile/TabBar.tsx
import React from "react";

export type Tab = "home" | "mural" | "recorrente";

interface TabBarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
}

export function TabBar({ tab, setTab }: TabBarProps) {
  const items: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "home",
      label: "Metas",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      ),
    },
    {
      key: "mural",
      label: "Mural",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      key: "recorrente",
      label: "Recorrente",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center shrink-0 shadow-lg">
      {items.map((item) => {
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              active
                ? "text-[#124E66] font-bold scale-105"
                : "text-gray-600 font-medium hover:text-gray-700"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-blue-50 text-[#124E66]" : ""}`}>
              {item.icon}
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

