"use client";
import Link from "next/link";
import { Zap, ArrowUpRight, Radio, MapPin } from "lucide-react";
import { useDispatch } from "@/components/DispatchProvider";
export function DispatchOverview({
  role,
}: {
  role: "customer" | "technician";
}) {
  const { snapshot, error, loading } = useDispatch();
  const customer = role === "customer";
  return (
    <div className={`overview-banner ${customer ? "" : "partner"}`}>
      <div className="dispatch-orbit" aria-hidden="true">
        <span className="orbit-ring" />
        <span className="orbit-core">
          <Zap size={25} fill="currentColor" />
        </span>
        <span className="orbit-pin">
          <MapPin size={13} />
        </span>
      </div>
      <div>
        <p className="eyebrow">
          <Zap size={14} />{" "}
          {customer ? "THUNDERFIX NOW" : "YOUR NEIGHBOURHOOD, YOUR NEXT JOB"}
        </p>
        <h2>
          {customer
            ? "เสียตอนนี้ หาช่างใกล้คุณได้เลย"
            : "งานใกล้บ้าน รอฝีมือของคุณอยู่"}
        </h2>
        <p className="overview-banner-description">
          {customer
            ? "บอกอาการ ปักหมุด แล้วรับราคาและเวลาที่พร้อมมาจากช่าง"
            : "เปิดรับงานด่วน เลือกงานที่ตรงกับบริการ แล้วส่งข้อเสนอให้ลูกค้า"}
        </p>
        {!customer && (
          <span
            className={`status-pill ${snapshot.online ? "" : "orange-pill"} mt-3`}
          >
            <Radio size={12} />
            {error
              ? "ยังเชื่อมต่อระบบงานด่วนไม่ได้"
              : loading
                ? "กำลังตรวจสถานะ…"
                : snapshot.online
                  ? `เปิดรับงาน · ${snapshot.jobs.length} งานใกล้คุณ`
                  : "ยังไม่ได้เปิดรับงานด่วน"}
          </span>
        )}
      </div>
      <Link href={`/dashboard/${role}/urgent`} className="button primary">
        {customer ? "เรียกช่างด่วน" : "ไปที่งานด่วนใกล้ฉัน"}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
