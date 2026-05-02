import React from "react";
import { Music2, Sparkles, Coins } from "lucide-react";

type TabType = "tracks" | "create" | "credits";

interface MobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "tracks", icon: <Music2 className="w-5 h-5" />, label: "Tracks" },
    { id: "create", icon: <Sparkles className="w-5 h-5" />, label: "Criar" },
    { id: "credits", icon: <Coins className="w-5 h-5" />, label: "Créditos" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-lg transition-all ${
              activeTab === tab.id
                ? "text-[#00D1FF]"
                : "text-white/40"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}