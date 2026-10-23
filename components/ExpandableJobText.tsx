"use client";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ExpandableJobText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = text.length > 90 || text.split("\n").length > 2;
  return (
    <div className="expandable-job-text">
      <p id={id} className={long && !expanded ? "is-collapsed" : undefined}>
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "ย่อข้อความ" : "อ่านรายละเอียดทั้งหมด"}
          <ChevronDown
            size={13}
            className={expanded ? "is-expanded" : undefined}
          />
        </button>
      )}
    </div>
  );
}
