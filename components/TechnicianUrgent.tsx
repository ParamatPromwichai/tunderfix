"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Clock3,
  LocateFixed,
  MapPin,
  MessageSquare,
  Navigation,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { dispatchAction, useDispatch } from "@/components/DispatchProvider";
import { ExpandableJobText } from "@/components/ExpandableJobText";
import { MapPicker } from "@/components/MapPicker";
import { MyUrgentOffers } from "@/components/MyUrgentOffers";
import type { DispatchJob } from "@/lib/dispatch";

function timeLeft(date: string, now: number) {
  if (!now) return "--:--";
  const seconds = Math.max(0, Math.ceil((Date.parse(date) - now) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TechnicianJobCard({
  job,
  now,
  disabled,
  onOffer,
}: {
  job: DispatchJob;
  now: number;
  disabled: boolean;
  onOffer: () => void;
}) {
  const closingSoon = now > 0 && Date.parse(job.expiresAt) - now <= 5 * 60000;
  return (
    <article
      className={`partner-job ${job.hasOffered ? "is-offered" : ""}`}
      aria-labelledby={`partner-job-${job.id}`}
    >
      <div className="partner-job-top">
        <span className="partner-job-tag">
          <Zap size={12} /> งานด่วน
        </span>
        <span className="partner-job-category">{job.category}</span>
        <span className="partner-job-number">#{job.id}</span>
      </div>
      <div className="partner-job-heading">
        <div>
          <h3 id={`partner-job-${job.id}`}>{job.title}</h3>
          <span>
            <MapPin size={12} /> จากตำแหน่งรับงานของคุณ
          </span>
        </div>
        <div className="partner-job-distance">
          <Navigation size={15} />
          <strong>
            {job.distanceKm === null
              ? "—"
              : job.distanceKm < 0.1
                ? "< 0.1"
                : job.distanceKm.toFixed(1)}
          </strong>
          <span>
            {job.distanceKm === null ? "ไม่ทราบระยะ" : "กม. โดยประมาณ"}
          </span>
        </div>
      </div>
      <div className="partner-job-description">
        <ExpandableJobText text={job.description} />
      </div>
      <div className="partner-job-facts">
        <div>
          <span>
            <Wallet size={13} /> งบของลูกค้า
          </span>
          <strong>
            {job.budgetMax
              ? `ไม่เกิน ฿${job.budgetMax.toLocaleString("th-TH")}`
              : "รอคุณเสนอราคา"}
          </strong>
        </div>
        <div className={closingSoon ? "is-closing" : undefined}>
          <span>
            <Clock3 size={13} /> ปิดรับข้อเสนอใน
          </span>
          <strong className="partner-time">
            {timeLeft(job.expiresAt, now)}
          </strong>
        </div>
      </div>
      {job.hasOffered ? (
        <div className="partner-job-offered">
          <CircleCheck size={17} />
          <span>ส่งข้อเสนอแล้ว · รอลูกค้ายืนยัน</span>
        </div>
      ) : (
        <button
          type="button"
          className="button primary partner-offer-button"
          disabled={disabled}
          onClick={onOffer}
        >
          เสนอราคาให้งานนี้ <ArrowRight size={17} />
        </button>
      )}
    </article>
  );
}

function OfferSheet({
  job,
  disabled,
  onClose,
  onSent,
}: {
  job: DispatchJob;
  disabled: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const noteId = useId();
  const [eta, setEta] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || disabled) return;
    if (Date.parse(job.expiresAt) <= Date.now()) {
      setError("ประกาศหมดเวลารับข้อเสนอแล้ว กรุณาเลือกงานอื่น");
      return;
    }
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await dispatchAction({
        action: "offer",
        jobId: job.id,
        price: Number(data.get("price")),
        etaMinutes: Number(data.get("eta")),
        note: String(data.get("note") || ""),
      });
      onSent();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "ส่งข้อเสนอไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialogRef}
      className="partner-offer-sheet"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="partner-sheet-grip" aria-hidden="true" />
      <div className="partner-sheet-heading">
        <div>
          <p>THUNDERFIX PARTNER</p>
          <h2 id={headingId}>ส่งข้อเสนอของคุณ</h2>
        </div>
        <button
          type="button"
          aria-label="ปิดฟอร์มเสนอราคา"
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="partner-sheet-job">
        <span>
          <Wrench size={18} />
        </span>
        <div>
          <strong>{job.title}</strong>
          <p>
            {job.category} · งาน #{job.id}
            {job.budgetMax
              ? ` · งบไม่เกิน ฿${job.budgetMax.toLocaleString("th-TH")}`
              : ""}
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="partner-quote-form" aria-busy={busy}>
        <div className="partner-quote-fields">
          <label>
            ราคาเสนอ <span>บาท</span>
            <input
              autoFocus
              name="price"
              type="number"
              inputMode="decimal"
              min="1"
              max="1000000"
              step="0.01"
              placeholder="เช่น 500"
              required
              disabled={busy}
            />
          </label>
          <label>
            พร้อมถึงใน <span>นาที</span>
            <input
              name="eta"
              type="number"
              inputMode="numeric"
              min="5"
              max="240"
              step="1"
              placeholder="เช่น 30"
              value={eta}
              onChange={(event) => setEta(event.target.value)}
              required
              disabled={busy}
            />
          </label>
        </div>
        <div className="partner-eta-options">
          <span>เวลาที่พร้อมไปถึง</span>
          {[15, 30, 60].map((minutes) => (
            <button
              type="button"
              key={minutes}
              disabled={busy}
              aria-pressed={eta === String(minutes)}
              onClick={() => setEta(String(minutes))}
            >
              {minutes} นาที
            </button>
          ))}
        </div>
        <label className="partner-quote-note">
          ข้อความถึงลูกค้า <span>ไม่บังคับ</span>
          <textarea
            name="note"
            maxLength={500}
            rows={2}
            placeholder="เช่น รวมค่าเดินทาง ยังไม่รวมอะไหล่"
            aria-describedby={noteId}
            disabled={busy}
          />
        </label>
        <p id={noteId} className="partner-quote-hint">
          ระบุสิ่งที่รวมในราคา เพื่อให้ลูกค้าตัดสินใจได้ง่ายขึ้น
        </p>
        {(error || disabled) && (
          <p className="notice error" role="alert">
            {error || "การเชื่อมต่อขัดข้อง รอเชื่อมต่ออีกครั้งก่อนส่งข้อเสนอ"}
          </p>
        )}
        <div className="partner-sheet-footer">
          <p>
            <CircleCheck size={15} /> รอลูกค้ายืนยันก่อนออกเดินทาง
          </p>
          <button className="button primary" disabled={busy || disabled}>
            {busy ? "กำลังส่งข้อเสนอ…" : "ส่งราคาและเวลาที่พร้อมถึง"}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function UrgentTechnician() {
  const { snapshot, error: connectionError, loading, refresh } = useDispatch();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"nearby" | "offers">("nearby");
  const [sort, setSort] = useState("distance");
  const [selected, setSelected] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [sent, setSent] = useState(false);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);
  const jobs = snapshot.jobs
    .filter(
      (job) =>
        job.status === "requested" && (!now || Date.parse(job.expiresAt) > now),
    )
    .sort((a, b) =>
      sort === "expiry"
        ? Date.parse(a.expiresAt) - Date.parse(b.expiresAt)
        : (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
    );
  const waiting = snapshot.myOffers.filter(
    (offer) =>
      !offer.selected &&
      offer.status === "requested" &&
      (!now || Date.parse(offer.expiresAt) > now),
  ).length;
  const chosen = snapshot.myOffers.filter(
    (offer) =>
      offer.selected &&
      ["accepted", "on_the_way", "in_progress"].includes(offer.status),
  ).length;
  const selectedJob = snapshot.online
    ? jobs.find((job) => job.id === selected && !job.hasOffered)
    : undefined;
  async function updatePresence(
    location: { latitude: number; longitude: number },
    value: boolean,
  ) {
    try {
      await dispatchAction({ action: "presence", ...location, online: value });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตสถานะไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    if (snapshot.online && snapshot.location) {
      void updatePresence(snapshot.location, false);
      return;
    }
    if (position) {
      void updatePresence(position, true);
      return;
    }
    if (!navigator.geolocation) {
      setError("กรุณาปักหมุดพื้นที่รับงานบนแผนที่");
      setManual(true);
      setBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const location = {
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        };
        setPosition(location);
        void updatePresence(location, true);
      },
      () => {
        setError("เข้าถึงตำแหน่งไม่ได้ กรุณาปักหมุดพื้นที่รับงานเอง");
        setManual(true);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  async function refreshFeed() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }
  function changeTab(next: "nearby" | "offers") {
    setTab(next);
  }
  return (
    <div className="partner-dispatch">
      <header className="partner-page-heading">
        <div>
          <p>
            <Zap size={12} /> THUNDERFIX PARTNER
          </p>
          <h1>งานใกล้คุณ พร้อมให้ลุย</h1>
        </div>
        <Link
          href="/dashboard/technician/services"
          aria-label="ตั้งค่าประเภทบริการ"
        >
          <SlidersHorizontal size={18} />
          <span>ตั้งค่าบริการ</span>
        </Link>
      </header>
      <section
        className={`partner-availability ${snapshot.online ? "is-online" : ""} ${connectionError ? "is-disconnected" : ""}`}
        aria-label="สถานะการรับงาน"
      >
        <div className="partner-availability-main">
          <span className="partner-availability-symbol" aria-hidden="true">
            <Radio size={26} />
          </span>
          <div className="partner-availability-copy">
            <p>
              <span />
              {loading
                ? "กำลังตรวจสอบสถานะ"
                : connectionError
                  ? "การเชื่อมต่อขัดข้อง"
                  : snapshot.online
                    ? "เปิดรับงานด่วนอยู่"
                    : "พักรับงานอยู่"}
            </p>
            <h2>
              {loading
                ? "รอสักครู่…"
                : connectionError
                  ? "รอเชื่อมต่ออีกครั้ง"
                  : snapshot.online
                    ? "พร้อมรับงานใกล้คุณ"
                    : "พร้อมเมื่อไหร่ ก็เปิดรับงาน"}
            </h2>
          </div>
          <button
            type="button"
            className="partner-presence-toggle"
            role="switch"
            aria-checked={snapshot.online}
            aria-label="เปิดรับงานด่วน"
            disabled={busy || loading || !!connectionError}
            onClick={toggle}
          >
            <span />
            <span className="sr-only">
              {busy
                ? "กำลังอัปเดตสถานะ"
                : snapshot.online
                  ? "เปิดอยู่"
                  : "ปิดอยู่"}
            </span>
          </button>
        </div>
        <div className="partner-availability-bottom">
          <span>
            <MapPin size={13} />
            {busy
              ? "กำลังอัปเดตตำแหน่งและสถานะ…"
              : connectionError
                ? "ข้อมูลอาจยังไม่เป็นปัจจุบัน"
                : snapshot.online
                  ? "รับงานตามบริการและพื้นที่ของคุณ"
                  : "ยืนยันตำแหน่งเพื่อดูงานในพื้นที่"}
          </span>
          <span className="partner-live-mark">
            {loading
              ? "…"
              : connectionError
                ? "OFFLINE"
                : snapshot.online
                  ? "LIVE"
                  : "PAUSED"}
          </span>
        </div>
      </section>
      {(error || connectionError) && (
        <div className="notice error" role="alert">
          {error || connectionError}
        </div>
      )}
      {!snapshot.online && !loading && (
        <button
          type="button"
          className="partner-manual-location"
          disabled={busy}
          aria-expanded={manual}
          aria-controls="partner-location-picker"
          onClick={() => setManual(!manual)}
        >
          <LocateFixed size={15} />
          {position ? "เปลี่ยนตำแหน่งที่เลือก" : "เลือกตำแหน่งรับงานบนแผนที่"}
          <ArrowUpRight size={14} />
        </button>
      )}
      {manual && !snapshot.online && (
        <div className="partner-location-picker" id="partner-location-picker">
          <MapPicker
            initialLat={
              position?.latitude ?? snapshot.location?.latitude ?? 13.7563
            }
            initialLng={
              position?.longitude ?? snapshot.location?.longitude ?? 100.5018
            }
            onPositionChange={(latitude, longitude) =>
              setPosition({ latitude, longitude })
            }
          />
          <p>ปักหมุดตำแหน่งจริง แล้วเปิดสวิตช์รับงานด้านบน</p>
          {position && (
            <p className="location-confirmed">
              <Check size={14} /> เลือกแล้ว {position.latitude.toFixed(4)},{" "}
              {position.longitude.toFixed(4)}
            </p>
          )}
        </div>
      )}
      <div
        className="partner-dispatch-tabs"
        role="tablist"
        aria-label="งานด่วนและข้อเสนอ"
      >
        {(
          [
            {
              id: "nearby",
              title: "งานใกล้คุณ",
              icon: Navigation,
              count: snapshot.online ? jobs.length : 0,
            },
            {
              id: "offers",
              title: "ข้อเสนอของฉัน",
              icon: MessageSquare,
              count: waiting + chosen,
            },
          ] as const
        ).map((item) => (
          <button
            type="button"
            key={item.id}
            id={`partner-${item.id}-tab`}
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`partner-${item.id}-panel`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => changeTab(item.id)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "nearby"
                    : event.key === "End"
                      ? "offers"
                      : tab === "nearby"
                        ? "offers"
                        : "nearby";
                changeTab(next);
                document.getElementById(`partner-${next}-tab`)?.focus();
              }
            }}
          >
            <item.icon size={16} />
            {item.title}
            <span>{item.count}</span>
          </button>
        ))}
      </div>
      {sent && (
        <div className="partner-sent-notice" role="status">
          <CircleCheck size={18} />
          <span>ส่งข้อเสนอแล้ว รอลูกค้ายืนยันได้ที่นี่</span>
          <button
            type="button"
            aria-label="ปิดข้อความส่งข้อเสนอสำเร็จ"
            onClick={() => setSent(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="partner-dispatch-layout">
        <section
          id="partner-nearby-panel"
          role="tabpanel"
          aria-labelledby="partner-nearby-tab"
          hidden={tab !== "nearby"}
        >
          <>
            <div className="partner-feed-tools">
              <div>
                <h2>ประกาศในพื้นที่</h2>
                <p>
                  {loading
                    ? "กำลังโหลดข้อมูล"
                    : connectionError
                      ? "รออัปเดตข้อมูลล่าสุด"
                      : snapshot.online
                        ? `${jobs.length} งานที่ตรงกับบริการของคุณ`
                        : "เปิดรับงานเพื่อดูประกาศ"}
                </p>
              </div>
              <div className="partner-feed-actions">
                {snapshot.online && jobs.length > 1 && (
                  <select
                    aria-label="เรียงประกาศงาน"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                  >
                    <option value="distance">ใกล้ที่สุด</option>
                    <option value="expiry">ใกล้ปิดรับ</option>
                  </select>
                )}
                <button
                  type="button"
                  className={refreshing ? "is-refreshing" : ""}
                  aria-label="อัปเดตงานใกล้คุณ"
                  disabled={loading || refreshing}
                  onClick={() => void refreshFeed()}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="partner-feed-empty" role="status">
                <div className="partner-empty-radar">
                  <Radio size={27} />
                </div>
                <h3>กำลังดูงานใกล้คุณ</h3>
                <p>กำลังโหลดประกาศล่าสุดจากระบบ</p>
              </div>
            ) : connectionError && !jobs.length ? (
              <div className="partner-feed-empty">
                <div className="partner-empty-radar">
                  <RefreshCw size={27} />
                </div>
                <h3>ยังโหลดงานล่าสุดไม่ได้</h3>
                <p>ลองอัปเดตอีกครั้งเมื่อเชื่อมต่อได้</p>
                <button
                  type="button"
                  className="button secondary"
                  disabled={refreshing}
                  onClick={() => void refreshFeed()}
                >
                  ลองอีกครั้ง <RefreshCw size={15} />
                </button>
              </div>
            ) : !snapshot.online ? (
              <div className="partner-feed-empty">
                <div className="partner-empty-radar is-paused">
                  <Wrench size={27} />
                </div>
                <h3>พักให้พร้อม แล้วค่อยลุยต่อ</h3>
                <p>
                  เปิดสวิตช์รับงานด้านบนเมื่อต้องการ
                  <br />
                  ดูประกาศที่ตรงกับบริการของคุณ
                </p>
                <Link href="/dashboard/technician/services">
                  ตรวจสอบบริการที่รับทำ <ArrowUpRight size={14} />
                </Link>
              </div>
            ) : !jobs.length ? (
              <div className="partner-feed-empty">
                <div className="partner-empty-radar">
                  <Navigation size={27} />
                </div>
                <h3>พร้อมแล้ว รอประกาศใหม่ได้เลย</h3>
                <p>
                  งานที่ตรงกับบริการและพื้นที่ของคุณ
                  <br />
                  จะปรากฏที่นี่ อัปเดตทุก 5 วินาที
                </p>
                <Link href="/dashboard/technician/services">
                  จัดการประเภทบริการ <ArrowUpRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="partner-job-list">
                {jobs.map((job) => (
                  <TechnicianJobCard
                    key={job.id}
                    job={job}
                    now={now}
                    disabled={!!connectionError || busy}
                    onOffer={() => {
                      setSelected(job.id);
                      setSent(false);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        </section>
        <section
          id="partner-offers-panel"
          role="tabpanel"
          aria-labelledby="partner-offers-tab"
          hidden={tab !== "offers"}
        >
          <MyUrgentOffers now={now} />
        </section>
        <aside className="partner-dispatch-guide">
          <p className="partner-guide-kicker">พร้อมรับงานถัดไป</p>
          <h2>
            งานที่ถนัด
            <br />
            อยู่ใกล้กว่าที่คิด
          </h2>
          <ol>
            <li>
              <span>
                <MapPin size={17} />
              </span>
              <div>
                <strong>ตำแหน่งที่ใช่</strong>
                <p>ใช้ตำแหน่งรับงานของคุณเพื่อดูประกาศใกล้เคียง</p>
              </div>
            </li>
            <li>
              <span>
                <Wallet size={17} />
              </span>
              <div>
                <strong>ราคาที่ชัดเจน</strong>
                <p>บอกค่าเดินทางและอะไหล่ที่รวมในข้อเสนอ</p>
              </div>
            </li>
            <li>
              <span>
                <CircleCheck size={17} />
              </span>
              <div>
                <strong>ยืนยัน แล้วค่อยเดินทาง</strong>
                <p>เมื่อลูกค้าเลือกคุณ เปิดงานเพื่อคุยรายละเอียดในแชต</p>
              </div>
            </li>
          </ol>
          <Link href="/dashboard/technician/services">
            จัดการบริการของฉัน <ArrowUpRight size={15} />
          </Link>
          <p className="partner-presence-note">
            เปิดหน้านี้ไว้ขณะรับงาน สถานะจะพักอัตโนมัติเมื่อไม่ได้ใช้งานเกิน 90
            วินาที
          </p>
        </aside>
      </div>
      {selectedJob && (
        <OfferSheet
          key={selectedJob.id}
          job={selectedJob}
          disabled={!!connectionError}
          onClose={() => setSelected(null)}
          onSent={() => {
            setSelected(null);
            setSent(true);
            setTab("offers");
            requestAnimationFrame(() =>
              document
                .getElementById("partner-offers-tab")
                ?.focus({ preventScroll: true }),
            );
            void refresh();
          }}
        />
      )}
    </div>
  );
}
