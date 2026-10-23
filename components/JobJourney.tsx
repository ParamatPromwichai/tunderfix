"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CarFront, Wrench, CircleCheck, ArrowRight } from "lucide-react";
import { dispatchAction } from "@/components/DispatchProvider";
export function JobJourney({
  jobId,
  status,
  technician,
}: {
  jobId: string;
  status: string;
  technician?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const steps = [
    { status: "accepted", label: "ยืนยันช่าง", icon: Check },
    { status: "on_the_way", label: "กำลังเดินทาง", icon: CarFront },
    { status: "in_progress", label: "กำลังซ่อม", icon: Wrench },
    { status: "completed", label: "เสร็จสิ้น", icon: CircleCheck },
  ];
  const index = steps.findIndex((s) => s.status === status);
  useEffect(() => {
    if (
      ["requested", "accepted", "on_the_way", "in_progress"].includes(status)
    ) {
      const timer = setInterval(() => {
        if (!document.hidden) router.refresh();
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [status, router]);
  if (index < 0) return null;
  async function progress() {
    setBusy(true);
    setError("");
    try {
      await dispatchAction({
        action: "progress",
        jobId,
        status: status === "accepted" ? "on_the_way" : "in_progress",
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="job-journey panel" aria-label="สถานะการดำเนินงาน">
      <ol>
        {steps.map((step, i) => (
          <li
            key={step.status}
            className={i <= index ? "done" : ""}
            aria-current={i === index ? "step" : undefined}
          >
            <span>
              <step.icon size={18} />
            </span>
            <strong>{step.label}</strong>
          </li>
        ))}
      </ol>
      {technician && (status === "accepted" || status === "on_the_way") && (
        <div className="journey-action">
          <p>
            {status === "accepted"
              ? "คุยกับลูกค้าและยืนยันรายละเอียดก่อนออกเดินทาง"
              : "ถึงหน้างานแล้ว อัปเดตให้ลูกค้าทราบได้เลย"}
          </p>
          <button
            className="button primary"
            disabled={busy}
            onClick={() => void progress()}
          >
            {busy
              ? "กำลังอัปเดต…"
              : status === "accepted"
                ? "เริ่มออกเดินทาง"
                : "ถึงแล้ว · เริ่มดำเนินงาน"}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      {!technician && status !== "completed" && (
        <p className="fine-print mt-4">
          สถานะอัปเดตเมื่อช่างยืนยัน · ตกลงรายละเอียดเพิ่มเติมได้ในแชตของงาน
        </p>
      )}
      {error && (
        <p className="notice error mt-4" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
