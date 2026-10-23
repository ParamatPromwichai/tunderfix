"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  MessageSquare,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Signal,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import type { DispatchJob } from "@/lib/dispatch";
import { ExpandableJobText } from "@/components/ExpandableJobText";

type Props = {
  jobs: DispatchJob[];
  now: number;
  loading: boolean;
  connectionError: string;
  busy: boolean;
  onRefresh: () => Promise<void>;
  onChoose: (jobId: string, offerId: string) => Promise<void>;
  onCancel: (jobId: string) => Promise<void>;
  onNew: () => void;
};

function countdown(date: string, now: number) {
  if (!now) return "--:--";
  const seconds = Math.max(0, Math.ceil((Date.parse(date) - now) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function SearchCard({
  job,
  now,
  connectionError,
  busy,
  onChoose,
  onCancel,
}: Pick<Props, "now" | "connectionError" | "busy" | "onChoose" | "onCancel"> & {
  job: DispatchJob;
}) {
  const [paused, setPaused] = useState(false);
  const hasOffers = job.offers.length > 0;
  return (
    <article
      className={`dispatch-search-card ${hasOffers ? "has-offers" : ""} ${paused || connectionError ? "motion-paused" : ""}`}
      aria-labelledby={`search-job-${job.id}`}
    >
      <div className="dispatch-search-scene">
        <div className="dispatch-scene-top">
          <span
            className={`dispatch-live-label ${connectionError ? "is-disconnected" : ""}`}
          >
            <span />
            {connectionError
              ? "รอเชื่อมต่ออีกครั้ง"
              : hasOffers
                ? "มีช่างตอบกลับแล้ว"
                : "เปิดรับข้อเสนออยู่"}
          </span>
          <button
            type="button"
            className="dispatch-motion-toggle"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? "เล่นภาพค้นหา" : "พักภาพค้นหา"}
            title={paused ? "เล่นภาพค้นหา" : "พักภาพค้นหา"}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </div>
        <div className="dispatch-radar" aria-hidden="true">
          <svg
            className="dispatch-streets"
            viewBox="0 0 600 260"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M-20 65H160L200 105H360L400 65H620M-20 210H110L150 170H440L480 210H620M90-20V290M500-20V290M220-20V40L265 85V175L220 220V290M380-20V40L335 85V175L380 220V290" />
          </svg>
          <div className="dispatch-radar-disc">
            <div className="dispatch-radar-sweep" />
          </div>
          <div className="dispatch-radar-ring ring-one" />
          <div className="dispatch-radar-ring ring-two" />
          <div className="dispatch-radar-ring ring-three" />
          <div className="dispatch-radar-pulse" />
          <div className="dispatch-location-pin">
            {hasOffers ? (
              <Check size={27} strokeWidth={2.5} />
            ) : (
              <Wrench size={26} strokeWidth={2.2} />
            )}
          </div>
          <span className="dispatch-radius-label">
            รัศมี {job.radiusKm} กม.
          </span>
          <span className="dispatch-radar-caption">ภาพจำลองรัศมีค้นหา</span>
        </div>
        <div className="dispatch-scene-bottom">
          <span>
            <MapPin size={13} /> บริเวณที่คุณปักหมุด
          </span>
          <span>
            <Signal size={13} /> THUNDERFIX NOW
          </span>
        </div>
      </div>

      <div className="dispatch-search-body">
        <div className="dispatch-wait-heading">
          <div>
            <p className="dispatch-kicker">
              {job.category} <span>· #{job.id}</span>
            </p>
            <h2 id={`search-job-${job.id}`}>{job.title}</h2>
          </div>
          <div
            className="dispatch-countdown"
            aria-label="เวลารับข้อเสนอที่เหลือ"
          >
            <span>
              <Clock3 size={12} /> ปิดรับใน
            </span>
            <strong>{countdown(job.expiresAt, now)}</strong>
          </div>
        </div>
        <div className="dispatch-job-description">
          <ExpandableJobText text={job.description} />
        </div>
        <div className="dispatch-wait-status" role="status">
          <span className="dispatch-status-icon">
            {connectionError ? (
              <RefreshCw size={19} />
            ) : hasOffers ? (
              <MessageSquare size={19} />
            ) : (
              <Radio size={19} />
            )}
          </span>
          <div>
            <h3>
              {connectionError
                ? "กำลังรอเชื่อมต่อระบบ"
                : hasOffers
                  ? `${job.offers.length} ข้อเสนอ พร้อมให้คุณเลือก`
                  : "กำลังรอช่างที่พร้อมช่วยคุณ"}
            </h3>
            <p>
              {connectionError
                ? "จะแสดงข้อเสนอใหม่เมื่อเชื่อมต่อได้อีกครั้ง"
                : hasOffers
                  ? "ดูราคาและเวลาที่พร้อมมา ก่อนตัดสินใจ"
                  : "เมื่อช่างตอบกลับ ราคาและเวลาจะปรากฏที่นี่"}
            </p>
          </div>
          {!hasOffers && !connectionError && (
            <span className="dispatch-wait-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>

        {job.offers.length > 0 && (
          <div className="dispatch-quotes">
            {job.offers.map((offer) => (
              <div className="dispatch-quote" key={offer.id}>
                <div className="dispatch-quote-person">
                  <span className="dispatch-quote-avatar">
                    {offer.name.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{offer.name}</strong>
                    <p>
                      {offer.rating > 0 ? (
                        <>
                          <Star size={12} /> {offer.rating.toFixed(1)} ·{" "}
                          {offer.reviews} รีวิว
                        </>
                      ) : (
                        "ช่างใหม่ในระบบ"
                      )}
                    </p>
                  </div>
                </div>
                <div className="dispatch-quote-price">
                  <strong>฿{offer.price.toLocaleString("th-TH")}</strong>
                  <span>
                    <Clock3 size={12} /> ประมาณ {offer.etaMinutes} นาที
                  </span>
                </div>
                {offer.note && (
                  <p className="dispatch-quote-note">{offer.note}</p>
                )}
                <button
                  className="button primary"
                  disabled={busy || !!connectionError}
                  onClick={() => void onChoose(job.id, offer.id)}
                >
                  เลือกช่างคนนี้ <ArrowRight size={15} />
                </button>
              </div>
            ))}
            <p className="dispatch-price-note">
              ตรวจขอบเขตงานก่อนเลือกช่าง ราคาที่เลือกจะบันทึกเป็นราคาที่ตกลง
            </p>
          </div>
        )}

        {!hasOffers && (
          <ol className="dispatch-wait-steps" aria-label="ขั้นตอนการหาช่าง">
            <li className="is-done">
              <span>
                <Check size={11} />
              </span>
              ลงประกาศ
            </li>
            <li className="is-current" aria-current="step">
              <span>2</span>รอข้อเสนอ
            </li>
            <li>
              <span>3</span>เลือกช่าง
            </li>
          </ol>
        )}
        <div className="dispatch-search-footer">
          <span>
            {connectionError
              ? "ข้อมูลอาจยังไม่เป็นปัจจุบัน"
              : "อัปเดตอัตโนมัติทุก 5 วินาที"}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onCancel(job.id)}
          >
            ยกเลิกประกาศ
          </button>
        </div>
      </div>
    </article>
  );
}

function PastJob({ job }: { job: DispatchJob }) {
  const expired = job.status === "requested";
  const cancelled = job.status === "cancelled";
  const label = expired
    ? "หมดเวลารับข้อเสนอ"
    : cancelled
      ? "ยกเลิกแล้ว"
      : job.status === "completed"
        ? "เสร็จสิ้นแล้ว"
        : "เลือกช่างแล้ว";
  return (
    <article className="dispatch-past-job">
      <div>
        <p>
          {job.category} · #{job.id}
        </p>
        <h3>{job.title}</h3>
      </div>
      <span
        className={`dispatch-past-status ${!expired && !cancelled ? "is-matched" : ""}`}
      >
        {label}
      </span>
      {!expired && !cancelled && (
        <Link href={`/dashboard/customer/jobs/${job.id}`}>
          ติดตามงาน <ArrowUpRight size={14} />
        </Link>
      )}
    </article>
  );
}

export function UrgentTracking(props: Props) {
  const { jobs, now, loading, connectionError, busy, onRefresh, onNew } = props;
  const [refreshing, setRefreshing] = useState(false);
  const active = jobs.filter(
    (job) =>
      job.status === "requested" && (!now || Date.parse(job.expiresAt) > now),
  );
  const past = jobs.filter((job) => !active.includes(job));
  const latestExpired = jobs[0]?.status === "requested" && !active.length;
  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <section
      id="tracking-panel"
      role="tabpanel"
      aria-labelledby="tracking-tab"
      className="urgent-tracking"
    >
      <div className="dispatch-tracking-heading">
        <h2>ติดตามประกาศของคุณ</h2>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mobile-icon-action"
          aria-label="อัปเดตประกาศ"
          title="อัปเดตประกาศ"
          disabled={refreshing || loading || busy}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : undefined} />
          <span className="mobile-command-label">
            {refreshing ? "กำลังอัปเดต" : "อัปเดต"}
          </span>
        </button>
      </div>
      {loading ? (
        <div className="dispatch-loading" role="status">
          <div className="dispatch-loading-icon">
            <Radio size={30} />
          </div>
          <h3>กำลังโหลดประกาศของคุณ</h3>
          <p>รอสักครู่ กำลังตรวจสอบข้อเสนอล่าสุด</p>
        </div>
      ) : (
        <>
          {active.map((job) => (
            <SearchCard key={job.id} {...props} job={job} />
          ))}
          {!active.length && (
            <div className="dispatch-tracking-empty">
              <span>
                <Zap size={26} />
              </span>
              <h3>
                {connectionError
                  ? "ยังโหลดสถานะล่าสุดไม่ได้"
                  : latestExpired
                    ? "ประกาศหมดเวลารับข้อเสนอแล้ว"
                    : jobs.length
                      ? "พร้อมหาช่างให้งานครั้งต่อไป"
                      : "เรื่องซ่อมด่วน เริ่มได้ตรงนี้"}
              </h3>
              <p>
                {connectionError
                  ? "กดอัปเดตเพื่อลองเชื่อมต่ออีกครั้ง"
                  : latestExpired
                    ? "ยังไม่ได้เลือกช่าง ลงประกาศใหม่เพื่อรับข้อเสนออีกครั้งได้"
                    : jobs.length
                      ? "ไม่มีประกาศที่กำลังเปิดรับข้อเสนอ"
                      : "บอกปัญหา ปักหมุด แล้วรับข้อเสนอจากช่างใกล้คุณ"}
              </p>
              <button
                type="button"
                className="button primary"
                onClick={connectionError ? () => void refresh() : onNew}
                disabled={refreshing}
              >
                {connectionError ? "ลองเชื่อมต่ออีกครั้ง" : "ลงประกาศหาช่าง"}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          {past.length > 0 && (
            <details
              className="dispatch-history"
              open={active.length ? undefined : true}
            >
              <summary>
                <span>
                  ประกาศก่อนหน้า <b>{past.length}</b>
                </span>
                <ChevronDown size={16} />
              </summary>
              <div>
                {past.map((job) => (
                  <PastJob job={job} key={job.id} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
