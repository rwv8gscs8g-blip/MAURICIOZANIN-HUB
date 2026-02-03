"use client";

import { useMemo, useState } from "react";
import { MultimediaTimeline } from "@/components/timeline/MultimediaTimeline";

type TimelineEvent = {
  id: string;
  date: Date | string;
  title: string;
  description?: string;
  type: "VIDEO" | "DOC" | "NEWS" | "PROJECT" | "PUBLICATION";
  category?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  location?: string;
  axis?: string;
  hub: string;
};

type Props = {
  byHub: Record<string, TimelineEvent[]>;
  hubLabels: Record<string, string>;
};

export function TimelineHubFilters({ byHub, hubLabels }: Props) {
  const hubKeys = useMemo(() => Object.keys(byHub), [byHub]);
  const [selected, setSelected] = useState<string>("ALL");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected("ALL")}
          className={`px-3 py-1.5 text-xs border ${selected === "ALL"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-[#E2E8F0] text-[#64748B]"
            }`}
        >
          Todos
        </button>
        {hubKeys.map((hubKey) => (
          <button
            key={hubKey}
            type="button"
            onClick={() => setSelected(hubKey)}
            className={`px-3 py-1.5 text-xs border ${selected === hubKey
                ? "border-[#1E3A8A] text-[#1E3A8A]"
                : "border-[#E2E8F0] text-[#64748B]"
              }`}
          >
            {hubLabels[hubKey] || hubKey} ({byHub[hubKey]?.length || 0})
          </button>
        ))}
      </div>

      {selected === "ALL" ? (
        <div className="space-y-10">
          {hubKeys.map((hubKey) => (
            <section key={hubKey} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-fluid-xl font-semibold text-[#0F172A]">
                  {hubLabels[hubKey] || hubKey}
                </h3>
                <span className="text-xs text-[#64748B]">
                  {byHub[hubKey]?.length || 0} itens
                </span>
              </div>
              <MultimediaTimeline events={byHub[hubKey] || []} />
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-fluid-xl font-semibold text-[#0F172A]">
              {hubLabels[selected] || selected}
            </h3>
            <span className="text-xs text-[#64748B]">
              {byHub[selected]?.length || 0} itens
            </span>
          </div>
          <MultimediaTimeline events={byHub[selected] || []} />
        </div>
      )}
    </div>
  );
}
