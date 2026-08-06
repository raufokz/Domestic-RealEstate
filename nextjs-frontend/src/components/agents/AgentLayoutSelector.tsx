"use client";

import React from "react";
import {
  SparklesIcon,
  ColumnsIcon,
  CrownIcon,
  TableIcon,
  CheckIcon,
  BookmarkIcon,
} from "./AgentIcons";

export type AgentLayoutVariant =
  | "magazine"
  | "compass_split"
  | "glassmorphism"
  | "bloomberg_matrix";

interface AgentLayoutSelectorProps {
  currentLayout: AgentLayoutVariant;
  onSelectLayout: (layout: AgentLayoutVariant) => void;
  onSetDefault?: (layout: AgentLayoutVariant) => void;
  defaultLayout?: AgentLayoutVariant;
}

export const LAYOUT_OPTIONS: {
  id: AgentLayoutVariant;
  name: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "magazine",
    name: "Editorial Showcase",
    badge: "Vogue & Sotheby's Style",
    description: "High-fashion cover stories, client quote banners & direct inquiry modals",
    icon: SparklesIcon,
  },
  {
    id: "compass_split",
    name: "Compass Split Map",
    badge: "Zillow & Compass Style",
    description: "Sticky interactive territory map with real-time agent pin cards & city filters",
    icon: ColumnsIcon,
  },
  {
    id: "glassmorphism",
    name: "Executive Glass Studio",
    badge: "Dark Slate & Gold",
    description: "High-contrast dark glass background, neon gold badges & bio accordions",
    icon: CrownIcon,
  },
  {
    id: "bloomberg_matrix",
    name: "Bloomberg Ranking Matrix",
    badge: "Financial Data & Compare",
    description: "Data-dense matrix with market share progress bars & agent comparison drawer",
    icon: TableIcon,
  },
];

export default function AgentLayoutSelector({
  currentLayout,
  onSelectLayout,
  onSetDefault,
  defaultLayout,
}: AgentLayoutSelectorProps) {
  const isSavedAsDefault = defaultLayout === currentLayout;

  return (
    <div className="w-full bg-[#07162C] text-white border-b border-[#C9A227]/30 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/50 flex items-center justify-center text-[#C9A227] font-extrabold text-sm shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wide">
                Agent Page Layout Design Switcher
              </h3>
              <span className="bg-[#C9A227] text-[#07162C] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                4 Premium Layouts
              </span>
            </div>
            <p className="text-xs text-slate-300 font-body">
              Click any style to preview. Click "Integrate Choice" to lock as default.
            </p>
          </div>
        </div>

        {/* Center/Right Layout Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LAYOUT_OPTIONS.map((layout) => {
            const Icon = layout.icon;
            const isActive = currentLayout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => onSelectLayout(layout.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#C9A227] text-[#07162C] shadow-[0_4px_16px_rgba(201,162,39,0.4)] scale-105"
                    : "bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white border border-white/10"
                }`}
                title={`${layout.name}: ${layout.description}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#07162C]" : "text-[#C9A227]"}`} />
                <span>{layout.name}</span>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07162C] animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}

          {/* Integrate / Save Default Button */}
          {onSetDefault && (
            <button
              onClick={() => onSetDefault(currentLayout)}
              disabled={isSavedAsDefault}
              className={`ml-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all duration-200 cursor-pointer ${
                isSavedAsDefault
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:scale-105"
              }`}
            >
              {isSavedAsDefault ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Integrated</span>
                </>
              ) : (
                <>
                  <BookmarkIcon className="w-3.5 h-3.5 text-slate-950" />
                  <span>Integrate Choice</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
