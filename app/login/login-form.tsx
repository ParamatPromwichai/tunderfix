"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, LocateFixed, Check, LoaderCircle } from "lucide-react";
import { Brand } from "@/components/Brand";
import { MapPicker } from "@/components/MapPicker";

export function LoginForm({
  joiningAsTechnician = false,
}: {
  joiningAsTechnician?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(
    joiningAsTechnician ? "register" : "login",
  );
  const [role, setRole] = useState<"customer" | "technician">(
    joiningAsTechnician ? "technician" : "customer",
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [map, setMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const login = mode === "login";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!login && role === "technician" && !position) {
      setMessage("กรุณาระบุตำแหน่งรับงานของคุณก่อนสมัคร");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      ...(!login
        ? {
            fullName: String(form.get("fullName") || ""),
            phone: String(form.get("phone") || "") || null,
            role,
            ...(role === "technician"
              ? {
                  ...position,
                  serviceRadiusKm: Number(form.get("radius") || 20),
                }
              : {}),
          }
        : {}),
    };
    try {
      const response = await fetch(
        `/api/auth/${login ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        const fields = result.error?.details
          ? Object.values(result.error.details).flat()[0]
          : null;
        setMessage(
          typeof fields === "string"
            ? fields
            : login
              ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"
              : result.error?.message === "Email is already registered"
                ? "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ"
                : "สมัครไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองใหม่",
        );
        return;
      }
      const accountRole = result.data?.user?.role;
      const next = new URLSearchParams(window.location.search).get("next");
      const base = `/dashboard/${accountRole}`;
      router.push(
        accountRole === "customer" || accountRole === "technician"
          ? next &&
            (next === base || next.startsWith(`${base}/`)) &&
            !/[\\\r\n]/.test(next)
            ? next
            : base
          : "/",
      );
      router.refresh();
    } catch {
      setMessage("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }
  function locate() {
    setLocating(true);
    setMessage("");
    if (!navigator.geolocation) {
      setMap(true);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setMessage("เข้าถึงตำแหน่งไม่ได้ กรุณาปักหมุดเองบนแผนที่");
        setMap(true);
        setLocating(false);
      },
      { timeout: 15000, maximumAge: 0 },
    );
  }
  return (
    <div className="login-form">
      <div className="auth-mobile-brand">
        <Brand />
      </div>
      <p className="eyebrow orange">
        {login ? "WELCOME HOME" : "LET’S GET STARTED"}
      </p>
      <h2>{login ? "กลับมาดูแลเรื่องช่างกัน" : "เริ่มต้นกับ ThunderFix"}</h2>
      <p className="auth-subtitle">
        {login
          ? "เข้าสู่ระบบเพื่อเรียกช่าง หรือจัดการงานของคุณ"
          : "เลือกสิ่งที่คุณต้องการ แล้วเริ่มต้นได้เลย"}
      </p>
      <form onSubmit={submit} key={mode} className="auth-fields">
        {!login && (
          <>
            <fieldset className="role-choice">
              <legend>คุณต้องการใช้งานแบบไหน?</legend>
              <label className={role === "customer" ? "selected" : ""}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                />
                <strong>ฉันต้องการหาช่าง</strong>
                <small>ค้นหาและเรียกช่างมาช่วยดูแล</small>
              </label>
              <label className={role === "technician" ? "selected" : ""}>
                <input
                  type="radio"
                  name="role"
                  value="technician"
                  checked={role === "technician"}
                  onChange={() => setRole("technician")}
                />
                <strong>ฉันเป็นช่าง</strong>
                <small>รับงานและพบลูกค้าใกล้บ้าน</small>
              </label>
            </fieldset>
            <label className="field">
              ชื่อ–นามสกุล
              <input
                name="fullName"
                required
                minLength={2}
                maxLength={150}
                autoComplete="name"
                placeholder="ชื่อที่ต้องการให้แสดงในระบบ"
                disabled={busy}
              />
            </label>
          </>
        )}
        <label className="field">
          อีเมล
          <input
            type="email"
            name="email"
            required
            maxLength={191}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={busy}
          />
        </label>
        <label className="field">
          รหัสผ่าน
          <input
            type="password"
            name="password"
            required
            minLength={login ? 1 : 8}
            maxLength={72}
            autoComplete={login ? "current-password" : "new-password"}
            placeholder={login ? "กรอกรหัสผ่านของคุณ" : "อย่างน้อย 8 ตัวอักษร"}
            disabled={busy}
          />
        </label>
        {!login && (
          <label className="field">
            เบอร์โทรศัพท์ <span className="optional">ไม่บังคับ</span>
            <input
              type="tel"
              name="phone"
              maxLength={30}
              autoComplete="tel"
              placeholder="เบอร์ที่ติดต่อได้"
              disabled={busy}
            />
          </label>
        )}
        {!login && role === "technician" && (
          <div className="registration-location">
            <label className="field">
              รัศมีพื้นที่รับงาน
              <select name="radius" defaultValue="20">
                <option value="5">5 กม.</option>
                <option value="10">10 กม.</option>
                <option value="20">20 กม.</option>
                <option value="50">50 กม.</option>
              </select>
            </label>
            <div className="location-actions">
              <button
                className="button secondary"
                type="button"
                onClick={locate}
                disabled={locating}
              >
                <LocateFixed size={16} />
                {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => setMap((v) => !v)}
              >
                ปักหมุดเอง
              </button>
            </div>
            {map && (
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
                <Check size={15} /> ระบุตำแหน่งรับงานแล้ว
              </p>
            )}
            <p className="fine-print mt-3">
              หลังสมัคร ให้เพิ่มประเภทบริการและราคา
              เพื่อเริ่มรับงานที่ตรงกับทักษะของคุณ
            </p>
          </div>
        )}
        {message && (
          <p className="notice error" role="alert">
            {message}
          </p>
        )}
        <button
          className="button primary full"
          disabled={busy || locating}
          type="submit"
        >
          {busy ? (
            <>
              <LoaderCircle size={17} className="spin" /> กำลังดำเนินการ…
            </>
          ) : (
            <>
              {login ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-toggle">
        {login ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
        <button
          type="button"
          onClick={() => {
            setMode(login ? "register" : "login");
            setMessage("");
          }}
        >
          {login ? "สมัครใช้งาน" : "เข้าสู่ระบบ"}
        </button>
      </p>
    </div>
  );
}
