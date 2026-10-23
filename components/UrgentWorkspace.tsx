"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  MapPin,
  LocateFixed,
  ArrowRight,
  Radio,
  Check,
  Clock3,
  Wrench,
} from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { dispatchAction, useDispatch } from "@/components/DispatchProvider";
import { UrgentTracking } from "@/components/UrgentTracking";

function useClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <div className="notice error" role="alert">
      {message}
    </div>
  ) : null;
}

export function UrgentCustomer() {
  const {
    snapshot,
    error: connectionError,
    loading: connecting,
    refresh,
  } = useDispatch();
  const router = useRouter();
  const now = useClock();
  const [tab, setTab] = useState<"new" | "tracking">("new");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [categoryError, setCategoryError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [manual, setManual] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const formRef = useRef<HTMLFormElement>(null);
  function goToStep(step: 1 | 2) {
    setFormStep(step);
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 700px)").matches)
        formRef.current
          ?.querySelector<HTMLButtonElement>(
            '.urgent-form-progress button[aria-current="step"]',
          )
          ?.focus({ preventScroll: true });
      else
        document
          .getElementById(`urgent-step-heading-${step}`)
          ?.focus({ preventScroll: true });
    });
  }
  function validateFields(step?: 1 | 2) {
    const scope = step
      ? formRef.current?.querySelector(`[data-form-step="${step}"]`)
      : formRef.current;
    const fields = scope?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    const invalid = Array.from(fields || []).find(
      (field) => field.willValidate && !field.checkValidity(),
    );
    if (!invalid) return true;
    const targetStep =
      invalid.closest("[data-form-step]")?.getAttribute("data-form-step") ===
      "2"
        ? 2
        : 1;
    setFormStep(targetStep);
    requestAnimationFrame(() => {
      invalid.focus({ preventScroll: true });
      invalid.reportValidity();
    });
    return false;
  }
  function nextStep() {
    if (validateFields(1)) {
      setError("");
      goToStep(2);
    }
  }
  const active = snapshot.jobs.find(
    (j) => j.status === "requested" && new Date(j.expiresAt).getTime() > now,
  );
  const initialTabSelected = useRef(false);
  useEffect(() => {
    if (!connecting && !initialTabSelected.current) {
      initialTabSelected.current = true;
      if (
        snapshot.jobs.some(
          (job) =>
            job.status === "requested" &&
            Date.parse(job.expiresAt) > Date.now(),
        )
      )
        setTab("tracking");
    }
  }, [connecting, snapshot.jobs]);
  useEffect(() => {
    fetch("/api/categories")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error();
        setCategories(d.data);
      })
      .catch(() =>
        setCategoryError("โหลดประเภทงานไม่ได้ กรุณารีเฟรชหรือลองใหม่อีกครั้ง"),
      );
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (window.matchMedia("(max-width: 700px)").matches && formStep === 1) {
      nextStep();
      return;
    }
    if (!validateFields()) return;
    if (!position) {
      goToStep(2);
      setError("กรุณาใช้ตำแหน่งปัจจุบัน หรือปักหมุดบนแผนที่ก่อนประกาศ");
      return;
    }
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await dispatchAction({
        action: "publish",
        categoryId: data.get("categoryId"),
        title: data.get("title"),
        description: data.get("description"),
        addressText: data.get("addressText"),
        radiusKm: Number(data.get("radiusKm")),
        budgetMax: data.get("budgetMax")
          ? Number(data.get("budgetMax"))
          : undefined,
        ...position,
      });
      await refresh();
      setTab("tracking");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ประกาศไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  function locate() {
    setLocating(true);
    setError("");
    if (!navigator.geolocation) {
      setError("อุปกรณ์นี้ไม่รองรับตำแหน่ง กรุณาปักหมุดเอง");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
        setManual(false);
        setLocating(false);
      },
      () => {
        setError("เข้าถึงตำแหน่งไม่ได้ คุณสามารถปักหมุดเองบนแผนที่ได้");
        setManual(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }
  async function choose(jobId: string, offerId: string) {
    setBusy(true);
    setError("");
    try {
      const result = await dispatchAction({ action: "choose", jobId, offerId });
      await refresh();
      router.push(`/dashboard/customer/jobs/${result.jobId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เลือกช่างไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function cancel(jobId: string) {
    setBusy(true);
    setError("");
    try {
      await dispatchAction({ action: "cancel", jobId });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ยกเลิกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={`urgent-workspace urgent-customer ${tab === "new" ? "is-composing" : "is-tracking"}`}
    >
      <div className="page-heading">
        <div>
          <p className="eyebrow orange">
            <Zap size={14} /> THUNDERFIX NOW
          </p>
          <h1>เรื่องด่วน ให้ช่างใกล้คุณช่วย</h1>
          <p>บอกปัญหาครั้งเดียว แล้วเลือกจากช่างที่พร้อมเข้ามาดูแล</p>
        </div>
        <span className="outline-label">
          <Radio size={15} /> ประกาศถึงช่างใกล้คุณ
        </span>
      </div>
      <div
        className="segmented-tabs"
        role="tablist"
        aria-label="เรียกด่วน"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const next = tab === "new" ? "tracking" : "new";
            setTab(next);
            document
              .getElementById(next === "new" ? "new-job-tab" : "tracking-tab")
              ?.focus();
          }
        }}
      >
        <button
          role="tab"
          aria-selected={tab === "new"}
          aria-controls="new-job-panel"
          id="new-job-tab"
          onClick={() => setTab("new")}
        >
          ลงประกาศด่วน
        </button>
        <button
          role="tab"
          aria-selected={tab === "tracking"}
          aria-controls="tracking-panel"
          id="tracking-tab"
          onClick={() => setTab("tracking")}
        >
          ติดตามงาน {active && <span className="tiny-dot" />}
        </button>
      </div>
      <ErrorNotice message={error || connectionError || categoryError} />
      {tab === "new" ? (
        <div
          className="urgent-layout urgent-compose-layout"
          id="new-job-panel"
          role="tabpanel"
          aria-labelledby="new-job-tab"
        >
          <form
            ref={formRef}
            noValidate
            className="dispatch-form panel urgent-wizard"
            data-current-step={formStep}
            onSubmit={submit}
          >
            <nav className="urgent-form-progress" aria-label="ขั้นตอนลงประกาศ">
              <button
                type="button"
                aria-current={formStep === 1 ? "step" : undefined}
                onClick={() => goToStep(1)}
              >
                <span>{formStep === 2 ? <Check size={13} /> : "1"}</span>
                รายละเอียดงาน
              </button>
              <span className="form-progress-line" aria-hidden="true" />
              <button
                type="button"
                aria-current={formStep === 2 ? "step" : undefined}
                onClick={nextStep}
              >
                <span>2</span>สถานที่
              </button>
              <small>ขั้นตอน {formStep}/2</small>
            </nav>
            <fieldset data-form-step="1" className="urgent-form-step">
              <legend className="sr-only">รายละเอียดงาน</legend>
              <div className="section-number">
                <span>01</span>
                <div>
                  <h2 id="urgent-step-heading-1" tabIndex={-1}>
                    ต้องการให้ช่วยเรื่องอะไร?
                  </h2>
                  <p>รายละเอียดที่ชัด ช่วยให้ช่างประเมินได้เร็วขึ้น</p>
                </div>
              </div>
              <div className="field-grid">
                <label className="field">
                  ประเภทงาน
                  <select name="categoryId" required defaultValue="">
                    <option value="" disabled>
                      เลือกประเภทบริการ
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  รัศมีค้นหาช่าง
                  <select name="radiusKm" defaultValue="10">
                    <option value="5">ภายใน 5 กม.</option>
                    <option value="10">ภายใน 10 กม.</option>
                    <option value="20">ภายใน 20 กม.</option>
                    <option value="50">ภายใน 50 กม.</option>
                  </select>
                </label>
              </div>
              <label className="field">
                ปัญหาที่ต้องการซ่อม
                <input
                  name="title"
                  placeholder="เช่น น้ำรั่วใต้อ่างล้างจาน"
                  required
                  minLength={3}
                  maxLength={200}
                />
              </label>
              <label className="field">
                รายละเอียด
                <textarea
                  name="description"
                  rows={2}
                  placeholder="อาการที่พบ จุดที่ต้องซ่อม หรือสิ่งที่อยากให้ช่างเตรียมมา"
                  required
                  minLength={5}
                  maxLength={3000}
                />
              </label>
              <label className="field">
                งบประมาณสูงสุด <span className="optional">ไม่บังคับ · บาท</span>
                <input
                  type="number"
                  name="budgetMax"
                  min="1"
                  max="1000000"
                  step="0.01"
                  placeholder="ระบุงบเพื่อให้ช่างเสนอราคาได้เหมาะสม"
                />
              </label>
            </fieldset>
            <fieldset data-form-step="2" className="urgent-form-step">
              <legend className="sr-only">สถานที่รับบริการ</legend>
              <div className="section-number form-divider">
                <span>02</span>
                <div>
                  <h2 id="urgent-step-heading-2" tabIndex={-1}>
                    ให้ช่างไปที่ไหน?
                  </h2>
                  <p>ตำแหน่งใช้ค้นหาช่างในรัศมีที่คุณเลือก</p>
                </div>
              </div>
              <label className="field">
                ที่อยู่และจุดสังเกต
                <textarea
                  name="addressText"
                  rows={2}
                  required
                  minLength={5}
                  maxLength={1000}
                  placeholder="บ้านเลขที่ ซอย แขวง/ตำบล และจุดสังเกต"
                />
              </label>
              <div className="location-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={locate}
                  disabled={locating}
                >
                  <LocateFixed size={17} />
                  {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setManual((v) => !v)}
                >
                  ปักหมุดเองบนแผนที่
                </button>
              </div>
              {manual && (
                <div className="dispatch-map">
                  <MapPicker
                    initialLat={position?.latitude ?? 13.7563}
                    initialLng={position?.longitude ?? 100.5018}
                    onPositionChange={(latitude, longitude) =>
                      setPosition({ latitude, longitude })
                    }
                  />
                </div>
              )}
              {position && (
                <p className="location-confirmed">
                  <Check size={15} /> ยืนยันตำแหน่ง{" "}
                  {position.latitude.toFixed(4)},{" "}
                  {position.longitude.toFixed(4)}
                </p>
              )}
            </fieldset>
            <div className="urgent-form-footer">
              <div className="submit-summary">
                <p>
                  <Clock3 size={15} /> ประกาศเปิดรับข้อเสนอ 30 นาที
                </p>
                <p>ยังไม่มีค่าใช้จ่ายจนกว่าจะตกลงกับช่าง</p>
              </div>
              <div className="urgent-wizard-actions">
                <button
                  className="button secondary wizard-back"
                  type="button"
                  onClick={() => goToStep(1)}
                >
                  ย้อนกลับ
                </button>
                <button
                  className="button primary full wizard-next"
                  type="button"
                  onClick={nextStep}
                >
                  ถัดไป · ระบุสถานที่ <ArrowRight size={17} />
                </button>
                {active ? (
                  <button
                    className="button primary full wizard-submit"
                    type="button"
                    onClick={() => setTab("tracking")}
                  >
                    คุณมีประกาศที่เปิดอยู่ · ไปติดตามงาน{" "}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    className="button primary full wizard-submit"
                    disabled={
                      busy ||
                      connecting ||
                      !!connectionError ||
                      !categories.length
                    }
                  >
                    <Zap size={18} />
                    {busy ? "กำลังส่งประกาศ…" : "ประกาศหาช่างด่วน"}
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </form>
          <aside className="dispatch-explainer">
            <div className="radar-illustration" aria-hidden="true">
              <div className="radar-ring r1" />
              <div className="radar-ring r2" />
              <div className="radar-ring r3" />
              <span className="radar-home">
                <MapPin size={28} />
              </span>
              <span className="radar-worker w1">
                <Wrench size={18} />
              </span>
              <span className="radar-worker w2">
                <Wrench size={18} />
              </span>
              <span className="radar-worker w3">
                <Wrench size={18} />
              </span>
            </div>
            <p className="eyebrow">NEARBY. READY. FIXED.</p>
            <h2>
              ช่างที่ใช่
              <br />
              อยู่ใกล้กว่าที่คิด
            </h2>
            <ol className="dispatch-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>บอกปัญหาและปักหมุด</strong>
                  <p>เราค้นหาช่างที่รับบริการประเภทนี้ในพื้นที่</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>รับราคาและเวลาที่พร้อมมา</strong>
                  <p>ช่างที่เปิดรับงานจะเห็นประกาศของคุณ</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>เลือกช่าง แล้วคุยรายละเอียด</strong>
                  <p>ยืนยันราคาและนัดหมายในแชตก่อนเดินทาง</p>
                </div>
              </li>
            </ol>
            <p className="fine-print">
              ความพร้อมขึ้นอยู่กับช่างในพื้นที่
              เวลาที่แสดงเป็นเวลาประเมินจากช่าง ไม่ใช่การติดตามรถแบบเรียลไทม์
            </p>
          </aside>
        </div>
      ) : (
        <UrgentTracking
          jobs={snapshot.jobs}
          now={now}
          loading={connecting}
          connectionError={connectionError}
          busy={busy}
          onRefresh={refresh}
          onChoose={choose}
          onCancel={cancel}
          onNew={() => setTab("new")}
        />
      )}
    </div>
  );
}

export { UrgentTechnician } from "@/components/TechnicianUrgent";
