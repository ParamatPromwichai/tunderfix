"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, X } from "lucide-react";
import type { DispatchSnapshot } from "@/lib/dispatch";
export async function dispatchAction(payload: Record<string, unknown>) {
  const response = await fetch("/api/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "ทำรายการไม่สำเร็จ กรุณาลองใหม่",
    );
  return data;
}
const DispatchContext = createContext<{
  snapshot: DispatchSnapshot;
  error: string;
  loading: boolean;
  refresh: () => Promise<void>;
} | null>(null);
export function useDispatch() {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("DispatchProvider is required");
  return ctx;
}
export function DispatchProvider({
  role,
  children,
}: {
  role: "customer" | "technician";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<DispatchSnapshot>({
    jobs: [],
    myOffers: [],
    online: false,
    location: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    id: string;
    title: string;
    distance: number | null;
  } | null>(null);
  const [assigned, setAssigned] = useState<{
    jobId: string;
    title: string;
  } | null>(null);
  const seen = useRef(new Set<string>());
  const busy = useRef(false);
  const state = useRef(snapshot);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const response = await fetch("/api/dispatch", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "เชื่อมต่อไม่ได้");
      const next = data as DispatchSnapshot;
      state.current = next;
      setSnapshot(next);
      setError("");
      if (role === "technician") {
        const chosen = next.myOffers.find(
          (o) =>
            o.selected &&
            ["accepted", "on_the_way", "in_progress"].includes(o.status) &&
            !seen.current.has(`assigned:${o.jobId}`),
        );
        if (chosen) setAssigned({ jobId: chosen.jobId, title: chosen.title });
        next.myOffers
          .filter((o) => o.selected)
          .forEach((o) => seen.current.add(`assigned:${o.jobId}`));
      }
      if (role === "technician" && next.online) {
        const fresh = next.jobs.find(
          (j) => !seen.current.has(j.id) && !j.hasOffered,
        );
        if (fresh)
          setAlert({
            id: fresh.id,
            title: fresh.title,
            distance: fresh.distanceKm,
          });
        next.jobs.forEach((j) => seen.current.add(j.id));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "เชื่อมต่อไม่ได้");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [role]);
  useEffect(() => {
    void refresh();
    const poll = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 5000);
    const heartbeat = setInterval(() => {
      const s = state.current;
      if (role === "technician" && !document.hidden && s.online && s.location)
        void dispatchAction({
          action: "presence",
          online: true,
          ...s.location,
        }).catch(() => {});
    }, 30000);
    const visible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(poll);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh, role]);
  const current =
    alert &&
    snapshot.online &&
    snapshot.jobs.some((j) => j.id === alert.id && !j.hasOffered)
      ? alert
      : null;
  return (
    <DispatchContext.Provider value={{ snapshot, error, loading, refresh }}>
      {children}
      {assigned ? (
        <aside className="dispatch-toast" role="status">
          <BellRing size={23} />
          <div>
            <strong>ลูกค้าเลือกคุณแล้ว</strong>
            <p>{assigned.title}</p>
            <Link
              href={`/dashboard/technician/jobs/${assigned.jobId}`}
              onClick={() => setAssigned(null)}
            >
              ดูงานและคุยกับลูกค้า →
            </Link>
          </div>
          <button
            aria-label="ปิดการแจ้งเตือน"
            onClick={() => setAssigned(null)}
          >
            <X size={18} />
          </button>
        </aside>
      ) : (
        current &&
        pathname !== "/dashboard/technician/urgent" && (
          <aside
            className="dispatch-toast"
            role="status"
            aria-label="มีงานด่วนใหม่"
          >
            <BellRing size={23} />
            <div>
              <strong>มีงานด่วนใกล้คุณ</strong>
              <p>
                {current.title} · {current.distance?.toFixed(1)} กม.
              </p>
              <Link
                href="/dashboard/technician/urgent"
                onClick={() => setAlert(null)}
              >
                ดูงานและส่งข้อเสนอ →
              </Link>
            </div>
            <button aria-label="ปิดการแจ้งเตือน" onClick={() => setAlert(null)}>
              <X size={18} />
            </button>
          </aside>
        )
      )}
    </DispatchContext.Provider>
  );
}
