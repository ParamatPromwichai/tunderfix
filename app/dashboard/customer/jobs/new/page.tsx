"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getTechnicianNameAction } from "./actions";
import { MapPicker } from "@/components/MapPicker";
import { ArrowRight, Check, LocateFixed, MapPin } from "lucide-react";

const SUGGESTIONS: Record<string, { titles: string[]; desc: string[] }> = {
  ซ่อมมือถือ: {
    titles: [
      "จอแตก",
      "แบตเสื่อม",
      "เปิดไม่ติด",
      "ชาร์จไม่เข้า",
      "เครื่องรวน",
      "ตกน้ำ",
    ],
    desc: [
      "เปิดติด ใช้งานได้บางส่วน",
      "เปิดไม่ติดเลย",
      "หน้าจอมืดแต่มีเสียง",
      "มีอาการค้างบ่อย",
      "ชาร์จแบตไม่เข้าเลย",
    ],
  },
  ซ่อมแอร์: {
    titles: [
      "แอร์ไม่เย็น",
      "น้ำแอร์หยด",
      "มีกลิ่นอับ",
      "แอร์เปิดไม่ติด",
      "เสียงดังผิดปกติ",
      "ล้างแอร์ทั่วไป",
    ],
    desc: [
      "แอร์มีแต่ลมออกมา",
      "ไฟที่ตัวเครื่องกะพริบ",
      "พัดลมคอยล์ร้อนไม่หมุน",
      "ไม่ได้ล้างแอร์เกิน 1 ปี",
    ],
  },
  ซ่อมคอมพิวเตอร์: {
    titles: [
      "เปิดไม่ติด",
      "จอฟ้า",
      "เครื่องค้างบ่อย",
      "เครื่องช้ามาก",
      "ติดไวรัส",
      "เพิ่มแรม/เปลี่ยน SSD",
    ],
    desc: [
      "มีเสียงร้องตอนเปิด",
      "เปิดเครื่องติดแต่จอไม่มีภาพ",
      "เข้าวินโดวส์ไม่ได้",
      "เน็ตหลุดบ่อยมาก",
    ],
  },
  เครื่องใช้ไฟฟ้า: {
    titles: [
      "เครื่องซักผ้าไม่ปั่น",
      "ตู้เย็นไม่เย็น",
      "ทีวีไม่มีภาพ",
      "พัดลมไม่หมุน",
      "ไมโครเวฟไม่ร้อน",
    ],
    desc: [
      "เสียบปลั๊กแล้วไฟไม่เข้า",
      "มีไฟเข้าแต่เครื่องไม่ทำงาน",
      "มีเสียงดังตอนเครื่องทำงาน",
      "ปุ่มกดไม่ตอบสนอง",
    ],
  },
  ซ่อมประปา: {
    titles: [
      "ท่อตัน",
      "น้ำรั่วซึม",
      "ก๊อกน้ำเสีย",
      "ชักโครกกดไม่ลง",
      "ปั๊มน้ำไม่ตัด",
      "ติดตั้งเครื่องทำน้ำอุ่น",
    ],
    desc: [
      "น้ำไหลช้ามาก",
      "มีน้ำหยดตลอดเวลาแม้จะปิดแล้ว",
      "ปั๊มน้ำทำงานตลอดเวลา",
      "หาจุดที่รั่วไม่เจอ",
    ],
  },
  ซ่อมไฟฟ้า: {
    titles: [
      "ไฟดับบางจุด",
      "ปลั๊กไฟช็อต",
      "เปลี่ยนหลอดไฟ/โคมไฟ",
      "เดินสายไฟใหม่",
      "ติดตั้งปลั๊กเพิ่ม",
      "ไฟตก/ไฟกระชาก",
    ],
    desc: [
      "เบรกเกอร์ตัดบ่อย (ทริป)",
      "มีกลิ่นเหม็นไหม้แถวปลั๊ก",
      "ไฟกะพริบตลอดเวลาที่เปิด",
      "เสียบเครื่องใช้ไฟฟ้าแล้วไฟดับ",
    ],
  },
  default: {
    titles: [
      "เครื่องเปิดไม่ติด",
      "มีเสียงดังผิดปกติ",
      "ใช้งานไม่ได้ตามปกติ",
      "ต้องการตรวจเช็คสภาพ",
      "ต้องการติดตั้งใหม่",
    ],
    desc: [
      "เปิดไม่ติดเลย ไม่มีไฟเข้า",
      "มีเสียงแปลกๆ ตอนใช้งาน",
      "เพิ่งมีอาการนี้เมื่อไม่กี่วันก่อน",
      "ไม่เคยซ่อมเครื่องนี้มาก่อน",
    ],
  },
};

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const technicianId = searchParams.get("technicianId");
  const categoryIdFromUrl = searchParams.get("categoryId");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryIdFromUrl || "",
  );
  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");

  const [technicianName, setTechnicianName] = useState<string | null>(null);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [showMap, setShowMap] = useState(false);
  const [positionConfirmed, setPositionConfirmed] = useState(false);
  const [locating, setLocating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function goToStep(next: 1 | 2) {
    setStep(next);
    requestAnimationFrame(() =>
      formRef.current
        ?.querySelector<HTMLButtonElement>(
          '.scheduled-progress [aria-current="step"]',
        )
        ?.focus({ preventScroll: true }),
    );
  }
  function validate(stepToValidate?: 1 | 2) {
    const scope = stepToValidate
      ? formRef.current?.querySelector(
          `[data-scheduled-step="${stepToValidate}"]`,
        )
      : formRef.current;
    const fields = scope?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    const invalid = Array.from(fields || []).find(
      (field) => field.willValidate && !field.checkValidity(),
    );
    if (!invalid) return true;
    setStep(
      invalid
        .closest("[data-scheduled-step]")
        ?.getAttribute("data-scheduled-step") === "2"
        ? 2
        : 1,
    );
    requestAnimationFrame(() => {
      invalid.focus({ preventScroll: true });
      invalid.reportValidity();
    });
    return false;
  }
  function nextStep() {
    if (validate(1)) {
      setError("");
      goToStep(2);
    }
  }
  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("อุปกรณ์นี้ไม่รองรับตำแหน่ง กรุณาปักหมุดเอง");
      setShowMap(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setPositionConfirmed(true);
        setShowMap(false);
        setLocating(false);
      },
      () => {
        setError("เข้าถึงตำแหน่งไม่ได้ กรุณาปักหมุดเองบนแผนที่");
        setShowMap(true);
        setLocating(false);
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true },
    );
  }

  useEffect(() => {
    // Fetch categories on mount
    fetch("/api/categories")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error();
        setCategories(data.data || []);
      })
      .catch(() => setError("โหลดหมวดหมู่ไม่ได้ กรุณารีเฟรชแล้วลองใหม่"));

    // Fetch technician name if technicianId exists
    if (technicianId) {
      getTechnicianNameAction(technicianId)
        .then((name) => setTechnicianName(name))
        .catch(() => setError("โหลดข้อมูลช่างไม่ได้ กรุณาลองใหม่"));
    }
  }, [technicianId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (window.matchMedia("(max-width: 700px)").matches && step === 1) {
      nextStep();
      return;
    }
    if (!validate()) return;
    if (!positionConfirmed || lat === null || lng === null) {
      goToStep(2);
      setError("กรุณาใช้ตำแหน่งปัจจุบัน หรือปักหมุดสถานที่รับบริการก่อนส่งงาน");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      categoryId: formData.get("categoryId"),
      title: formData.get("title"),
      description: formData.get("description"),
      addressText: formData.get("addressText"),
      latitude: lat,
      longitude: lng,
      budgetMin: undefined,
      budgetMax: undefined,
      preferredDate: formData.get("preferredDate") || undefined,
      preferredTime: formData.get("preferredTime") || undefined,
      technicianId: technicianId || undefined,
    };

    try {
      const res = await fetch("/api/customer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "ส่งงานไม่สำเร็จ กรุณาลองใหม่",
        );

      router.push(`/dashboard/customer/jobs/${data.jobId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const selectedCatName =
    categories.find((c) => c.id === selectedCategory)?.name || "";
  let currentSuggestions = SUGGESTIONS["default"];

  for (const key in SUGGESTIONS) {
    if (key !== "default" && selectedCatName.includes(key)) {
      currentSuggestions = SUGGESTIONS[key];
      break;
    }
  }

  const handleAppendDesc = (text: string) => {
    setDescValue((prev) => (prev ? `${prev} ${text}` : text));
  };

  return (
    <div
      className="scheduled-job-page max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
      data-direct-technician={!!technicianId}
    >
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-transform">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        </div>
        {technicianId && technicianName ? (
          <>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-600 tracking-tight">
              ส่งรายละเอียดให้ช่าง
            </h1>
            <p className="text-stone-500 text-sm sm:text-base font-medium max-w-sm mx-auto leading-relaxed">
              ส่งรายละเอียดให้{" "}
              <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 shadow-sm">
                {technicianName}
              </span>{" "}
              ประเมินราคา
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 tracking-tight">
              โพสต์หาช่างใหม่
            </h1>
            <p className="text-stone-500 text-sm sm:text-base font-medium max-w-sm mx-auto leading-relaxed">
              อธิบายปัญหาของคุณ
              เพื่อให้ช่างผู้เชี่ยวชาญเสนอราคาและเข้าช่วยเหลือคุณได้อย่างรวดเร็ว
            </p>
          </>
        )}
      </header>

      <form
        ref={formRef}
        noValidate
        data-scheduled-current={step}
        onSubmit={handleSubmit}
        className="scheduled-wizard bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-amber-900/5 border border-stone-100 p-5 sm:p-8 space-y-7 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600"></div>

        {error && (
          <div
            role="alert"
            className="scheduled-error p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 shadow-sm"
          >
            <svg
              className="w-5 h-5 shrink-0 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {error}
          </div>
        )}

        <nav className="scheduled-progress" aria-label="ขั้นตอนโพสต์หาช่าง">
          <button
            type="button"
            aria-current={step === 1 ? "step" : undefined}
            onClick={() => goToStep(1)}
          >
            <span>{step === 2 ? <Check size={13} /> : "1"}</span>รายละเอียดงาน
          </button>
          <span className="scheduled-progress-line" aria-hidden="true" />
          <button
            type="button"
            aria-current={step === 2 ? "step" : undefined}
            onClick={nextStep}
          >
            <span>2</span>สถานที่ / นัดหมาย
          </button>
        </nav>
        <div className="scheduled-fields space-y-7">
          <fieldset
            data-scheduled-step="1"
            className="scheduled-step space-y-7"
          >
            <legend className="sr-only">รายละเอียดงาน</legend>
            {/* หมวดหมู่ */}
            <div className="space-y-2">
              <label
                htmlFor="scheduled-category"
                className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
              >
                <span className="p-1 bg-amber-100 text-amber-600 rounded-md">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    ></path>
                  </svg>
                </span>
                หมวดหมู่งานซ่อม <span className="text-red-500">*</span>
              </label>
              <select
                id="scheduled-category"
                name="categoryId"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 rounded-2xl border border-stone-200 px-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer outline-none shadow-sm"
              >
                <option value="">-- เลือกหมวดหมู่ให้ตรงกับปัญหา --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* หัวข้อ */}
            <div className="space-y-2">
              <label
                htmlFor="scheduled-title"
                className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
              >
                <span className="p-1 bg-amber-100 text-amber-600 rounded-md">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </span>
                หัวข้องาน (สั้นๆ ให้เข้าใจง่าย){" "}
                <span className="text-red-500">*</span>
              </label>

              {selectedCategory && (
                <div
                  className="job-suggestions flex flex-wrap gap-2 mb-2"
                  role="group"
                  aria-label="ตัวอย่างหัวข้องาน เลื่อนเพื่อดูเพิ่มเติม"
                >
                  {currentSuggestions.titles.map((title, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTitleValue(title)}
                      className="px-3 py-1.5 text-[12px] font-bold bg-white text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow active:scale-95"
                    >
                      + {title}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                id="scheduled-title"
                minLength={3}
                maxLength={200}
                name="title"
                required
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="เช่น แอร์ไม่เย็น น้ำแอร์หยด ทีวีภาพเบลอ"
                className="w-full h-12 rounded-2xl border border-stone-200 px-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 hover:bg-white transition-all outline-none shadow-sm placeholder:text-stone-400"
              />
            </div>

            {/* รายละเอียด */}
            <div className="space-y-2">
              <label
                htmlFor="scheduled-description"
                className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
              >
                <span className="p-1 bg-amber-100 text-amber-600 rounded-md">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </span>
                รายละเอียดอาการเพิ่มเติม <span className="text-red-500">*</span>
              </label>

              {selectedCategory && (
                <div
                  className="job-suggestions flex flex-wrap gap-2 mb-2"
                  role="group"
                  aria-label="ตัวอย่างรายละเอียดอาการ เลื่อนเพื่อดูเพิ่มเติม"
                >
                  {currentSuggestions.desc.map((desc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendDesc(desc)}
                      className="px-3 py-1.5 text-[12px] font-bold bg-white text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all border border-stone-200 shadow-sm hover:shadow active:scale-95"
                    >
                      + {desc}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                id="scheduled-description"
                minLength={5}
                maxLength={3000}
                name="description"
                required
                rows={2}
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                placeholder="อธิบายปัญหาที่พบ ยี่ห้อรุ่น หรือข้อมูลที่จำเป็นสำหรับช่างเพื่อให้ประเมินราคาได้แม่นยำขึ้น..."
                className="w-full rounded-2xl border border-stone-200 p-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 hover:bg-white transition-all outline-none shadow-sm resize-none placeholder:text-stone-400"
              ></textarea>
            </div>
          </fieldset>
          <fieldset
            data-scheduled-step="2"
            className="scheduled-step space-y-7"
          >
            <legend className="sr-only">สถานที่และนัดหมาย</legend>
            {/* ที่อยู่และแผนที่ */}
            <div className="space-y-4 pt-2">
              <label
                htmlFor="scheduled-address"
                className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
              >
                <span className="p-1 bg-amber-100 text-amber-600 rounded-md">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                  </svg>
                </span>
                สถานที่ปฏิบัติงาน <span className="text-red-500">*</span>
              </label>
              <textarea
                id="scheduled-address"
                minLength={5}
                maxLength={1000}
                name="addressText"
                required
                rows={2}
                placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต จังหวัด..."
                className="w-full rounded-2xl border border-stone-200 p-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 hover:bg-white transition-all outline-none shadow-sm resize-none placeholder:text-stone-400"
              ></textarea>

              <div className="location-actions scheduled-location-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={locating}
                  onClick={locate}
                >
                  <LocateFixed size={16} />
                  {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setShowMap((value) => !value)}
                >
                  <MapPin size={14} />
                  ปักหมุดเอง
                </button>
              </div>
              {showMap && (
                <div className="scheduled-map rounded-2xl overflow-hidden border-2 border-stone-100 shadow-inner bg-stone-50 relative">
                  <MapPicker
                    initialLat={lat ?? 13.7563}
                    initialLng={lng ?? 100.5018}
                    nameLat="latitude"
                    nameLng="longitude"
                    onPositionChange={(latitude, longitude) => {
                      setLat(latitude);
                      setLng(longitude);
                      setPositionConfirmed(true);
                    }}
                  />
                </div>
              )}
              {positionConfirmed && (
                <p className="location-confirmed">
                  <Check size={14} />
                  ยืนยันตำแหน่งรับบริการแล้ว
                </p>
              )}
            </div>

            {/* วันเวลา */}
            <div className="scheduled-date-grid grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label
                  htmlFor="scheduled-date"
                  className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
                >
                  <span className="p-1 bg-stone-100 text-stone-500 rounded-md">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </span>
                  วันที่สะดวก (ทางเลือก)
                </label>
                <input
                  id="scheduled-date"
                  type="date"
                  name="preferredDate"
                  className="w-full h-12 rounded-2xl border border-stone-200 px-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 outline-none shadow-sm text-stone-600"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="scheduled-time"
                  className="text-sm font-extrabold text-stone-700 tracking-wide flex items-center gap-2"
                >
                  <span className="p-1 bg-stone-100 text-stone-500 rounded-md">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </span>
                  เวลาที่สะดวก (ทางเลือก)
                </label>
                <input
                  id="scheduled-time"
                  type="time"
                  name="preferredTime"
                  className="w-full h-12 rounded-2xl border border-stone-200 px-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 bg-stone-50/50 outline-none shadow-sm text-stone-600"
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* ปุ่ม Submit ปรับให้ขยายเต็มจอบนมือถือ */}
        <div className="scheduled-footer pt-8 mt-4 border-t border-stone-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia("(max-width: 700px)").matches && step === 2)
                goToStep(1);
              else router.back();
            }}
            className="scheduled-back w-full sm:w-auto px-6 py-3.5 text-sm rounded-2xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
          >
            <span className="scheduled-cancel-label">ยกเลิก</span>
            <span className="scheduled-back-label">ย้อนกลับ</span>
          </button>
          <button
            type="button"
            className="scheduled-next button primary"
            onClick={nextStep}
          >
            ถัดไป · สถานที่ <ArrowRight size={16} />
          </button>
          <button
            type="submit"
            disabled={loading || locating || !categories.length}
            className="scheduled-submit w-full sm:w-auto px-8 py-3.5 text-sm rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                {technicianId ? "ยืนยันส่งให้ช่าง" : "ยืนยันการโพสต์หาช่าง"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 pb-32 flex flex-col items-center justify-center text-stone-500 gap-4">
          <svg
            className="w-10 h-10 animate-spin text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          <span className="font-medium">กำลังโหลดแบบฟอร์ม...</span>
        </div>
      }
    >
      <NewJobForm />
    </Suspense>
  );
}
