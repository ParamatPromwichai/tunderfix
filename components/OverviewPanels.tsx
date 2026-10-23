"use client";

import { useState, type ReactNode } from "react";
import { BriefcaseBusiness, Bell, ArrowLeftRight } from "lucide-react";

export function OverviewPanels({
  children,
  secondaryLabel = "อัปเดตล่าสุด",
}: {
  children: [ReactNode, ReactNode];
  secondaryLabel?: string;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="overview-switcher">
      <div className="overview-tabs" role="tablist" aria-label="ข้อมูลภาพรวม">
        {[
          { label: "งานของฉัน", icon: BriefcaseBusiness },
          { label: secondaryLabel, icon: Bell },
        ].map((tab, index) => (
          <button
            key={tab.label}
            id={`overview-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls={`overview-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 1
                      : 1 - selected;
                setSelected(next);
                document.getElementById(`overview-tab-${next}`)?.focus();
              }
            }}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
        <ArrowLeftRight
          className="overview-tabs-hint"
          size={14}
          aria-hidden="true"
        />
      </div>
      <div className="overview-columns">
        {children.map((child, index) => (
          <div
            key={index}
            className={`overview-panel ${selected === index ? "is-selected" : ""}`}
            id={`overview-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`overview-tab-${index}`}
            tabIndex={0}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
