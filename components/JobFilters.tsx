"use client";
import { useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, X, BriefcaseBusiness } from "lucide-react";

export function JobFilters({
  jobs,
  children,
}: {
  jobs: { id: string; title: string; status: string }[];
  children: ReactNode[];
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const tabs = [
    { id: "all", name: "ทั้งหมด" },
    { id: "active", name: "กำลังดำเนินการ" },
    { id: "completed", name: "เสร็จสิ้น" },
    { id: "cancelled", name: "ยกเลิก" },
  ];
  const matches = (status: string) =>
    filter === "all" ||
    (filter === "active"
      ? !["completed", "cancelled"].includes(status)
      : status === filter);
  const visible = jobs
    .map((job, index) => ({ job, index }))
    .filter(
      ({ job }) =>
        matches(job.status) &&
        job.title
          .toLocaleLowerCase("th")
          .includes(query.toLocaleLowerCase("th").trim()),
    );
  return (
    <div className="job-browser">
      <div className="job-filter-toolbar">
        <div
          className="job-filter-tabs"
          role="group"
          aria-label="กรองตามสถานะงาน"
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
            >
              {tab.name}
              <span>
                {
                  jobs.filter(
                    (job) =>
                      tab.id === "all" ||
                      (tab.id === "active"
                        ? !["completed", "cancelled"].includes(job.status)
                        : job.status === tab.id),
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <label className="job-search">
          <Search size={16} />
          <span className="sr-only">ค้นหาจากชื่องาน</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่องาน…"
          />
        </label>
      </div>
      <p className="filter-result" role="status">
        <SlidersHorizontal size={13} /> แสดง {visible.length} จาก {jobs.length}{" "}
        งาน
        {(query || filter !== "all") && (
          <button
            type="button"
            aria-label="ล้างตัวกรอง"
            title="ล้างตัวกรอง"
            className="mobile-icon-action"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            <span className="mobile-command-label">ล้างตัวกรอง</span>{" "}
            <X size={12} />
          </button>
        )}
      </p>
      {visible.length ? (
        <div className="job-results-grid">
          {visible.map(({ index, job }) => (
            <div key={job.id}>{children[index]}</div>
          ))}
        </div>
      ) : (
        <div className="filter-empty">
          <BriefcaseBusiness size={27} />
          <h2>ยังไม่มีงานที่ตรงกับตัวกรองนี้</h2>
          <p>ลองเลือกสถานะอื่น หรือเปลี่ยนคำค้นหา</p>
        </div>
      )}
    </div>
  );
}
