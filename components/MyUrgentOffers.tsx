"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  CircleCheck,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { useDispatch } from "@/components/DispatchProvider";
import type { MyDispatchOffer } from "@/lib/dispatch";

function OfferRow({ offer, now }: { offer: MyDispatchOffer; now: number }) {
  const expired = now > 0 && Date.parse(offer.expiresAt) <= now;
  const waiting = !offer.selected && offer.status === "requested" && !expired;
  const matched = offer.selected && offer.status !== "cancelled";
  const label =
    offer.status === "cancelled"
      ? "งานถูกยกเลิก"
      : offer.selected
        ? offer.status === "completed"
          ? "เสร็จสิ้นแล้ว"
          : "ลูกค้าเลือกคุณแล้ว"
        : offer.status !== "requested"
          ? "ลูกค้าเลือกช่างอื่น"
          : expired
            ? "ประกาศหมดเวลา"
            : "รอลูกค้ายืนยัน";
  return (
    <article className={`partner-my-offer ${matched ? "is-selected" : ""}`}>
      <div className="partner-my-offer-top">
        <span
          className={`partner-my-offer-status ${waiting ? "is-waiting" : ""}`}
        >
          {matched ? (
            <CircleCheck size={13} />
          ) : waiting ? (
            <Clock3 size={13} />
          ) : null}
          {label}
        </span>
        <span>#{offer.jobId}</span>
      </div>
      <h3>{offer.title}</h3>
      <div className="partner-my-offer-bottom">
        <div>
          <span>ราคาที่คุณเสนอ</span>
          <strong>฿{offer.price.toLocaleString("th-TH")}</strong>
        </div>
        {offer.selected ? (
          <Link
            className="button secondary"
            href={`/dashboard/technician/jobs/${offer.jobId}`}
          >
            {offer.status === "completed" || offer.status === "cancelled"
              ? "ดูรายละเอียดงาน"
              : "เปิดงาน / แชต"}
            <ArrowUpRight size={15} />
          </Link>
        ) : waiting ? (
          <p>
            ลูกค้าจะเห็นราคา
            <br />
            และเวลาที่คุณพร้อมไปถึง
          </p>
        ) : null}
      </div>
    </article>
  );
}
export function MyUrgentOffers({ now }: { now: number }) {
  const { snapshot, loading } = useDispatch();
  const active = snapshot.myOffers.filter((offer) =>
    offer.selected
      ? ["accepted", "on_the_way", "in_progress"].includes(offer.status)
      : offer.status === "requested" &&
        (!now || Date.parse(offer.expiresAt) > now),
  );
  const history = snapshot.myOffers.filter((offer) => !active.includes(offer));
  if (loading)
    return (
      <div className="partner-feed-empty" role="status">
        <h3>กำลังโหลดข้อเสนอ…</h3>
      </div>
    );
  return (
    <section className="partner-my-offers" aria-label="ข้อเสนองานด่วนของฉัน">
      <div className="partner-feed-tools">
        <div>
          <h2>ข้อเสนอที่ต้องติดตาม</h2>
          <p>เมื่อลูกค้าเลือกคุณ เปิดงานเพื่อคุยรายละเอียดได้เลย</p>
        </div>
      </div>
      {!snapshot.myOffers.length ? (
        <div className="partner-feed-empty">
          <div className="partner-empty-radar is-paused">
            <MessageSquare size={27} />
          </div>
          <h3>ข้อเสนอแรกของคุณ เริ่มได้เลย</h3>
          <p>
            เลือกงานจากแท็บงานใกล้คุณ
            <br />
            แล้วส่งราคาและเวลาที่พร้อมไปถึง
          </p>
        </div>
      ) : (
        <>
          {active.length ? (
            <div className="partner-offer-list">
              {active.map((offer) => (
                <OfferRow key={offer.jobId} offer={offer} now={now} />
              ))}
            </div>
          ) : (
            <p className="partner-no-pending">
              ไม่มีข้อเสนอที่กำลังรอลูกค้ายืนยัน
            </p>
          )}
          {history.length > 0 && (
            <details
              className="partner-offer-history"
              open={active.length ? undefined : true}
            >
              <summary>
                <span>
                  ประวัติข้อเสนอ <b>{history.length}</b>
                </span>
                <ChevronDown size={16} />
              </summary>
              <div>
                {history.map((offer) => (
                  <OfferRow key={offer.jobId} offer={offer} now={now} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
