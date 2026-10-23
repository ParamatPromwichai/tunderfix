"use client";

import { useId, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Ellipsis,
  PlusSquare,
  Share,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import { usePwa } from "@/components/PwaProvider";

export function InstallAppCard() {
  const { installed, platform, canPrompt, install } = usePwa();
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  if (installed) return null;
  const openInstall = async () => {
    setBusy(true);
    const outcome = await install();
    setBusy(false);
    if (outcome === "unavailable") dialog.current?.showModal();
  };

  return (
    <section
      className="pwa-install-card"
      id="install-app"
      aria-label="ติดตั้งแอป ThunderFix"
    >
      <span className="pwa-app-mark" aria-hidden="true">
        <Zap size={26} fill="currentColor" />
      </span>
      <div className="pwa-install-copy">
        <h2>ThunderFix บนหน้าจอหลัก</h2>
        <p>เปิดดูงานและข้อความได้สะดวกขึ้น</p>
      </div>
      <button
        type="button"
        className="pwa-install-action"
        disabled={busy}
        onClick={openInstall}
      >
        <ArrowDownToLine size={18} aria-hidden="true" />
        {busy ? "กำลังเปิด…" : canPrompt ? "ติดตั้งแอป" : "วิธีติดตั้ง"}
      </button>
      <dialog
        ref={dialog}
        className="pwa-install-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target !== dialog.current) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            dialog.current.close();
        }}
      >
        <div className="pwa-dialog-heading">
          <span className="pwa-app-mark" aria-hidden="true">
            <Zap size={25} fill="currentColor" />
          </span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="ปิดวิธีติดตั้ง"
          >
            <X size={22} />
          </button>
        </div>
        <h2 id={titleId}>เปิด ThunderFix ได้ในแตะเดียว</h2>
        <p>เพิ่มแอปไว้บนหน้าจอหลัก ใช้ได้ทั้งบัญชีลูกค้าและช่าง</p>
        {platform === "ios" ? (
          <ol>
            <li>
              <Smartphone size={20} />
              <span>
                เปิดเว็บไซต์นี้ด้วย <strong>Safari</strong>
              </span>
            </li>
            <li>
              <Share size={20} />
              <span>
                แตะปุ่ม <strong>แชร์</strong> ในแถบเครื่องมือ
              </span>
            </li>
            <li>
              <PlusSquare size={20} />
              <span>
                เลือก <strong>เพิ่มไปยังหน้าจอโฮม</strong>
                <small>อาจอยู่ในเมนู “แก้ไขการทำงาน” หากยังไม่เห็น</small>
              </span>
            </li>
            <li>
              <ArrowDownToLine size={20} />
              <span>
                แตะ <strong>เพิ่ม</strong> เพื่อยืนยัน
              </span>
            </li>
          </ol>
        ) : (
          <ol>
            <li>
              <Smartphone size={20} />
              <span>
                เปิดเว็บใน <strong>Chrome หรือ Edge</strong>
              </span>
            </li>
            <li>
              <Ellipsis size={20} />
              <span>
                เปิดเมนูเบราว์เซอร์ แล้วเลือก{" "}
                <strong>ติดตั้ง ThunderFix</strong> หรือ{" "}
                <strong>เพิ่มไปยังหน้าจอหลัก</strong>
              </span>
            </li>
            <li>
              <ArrowDownToLine size={20} />
              <span>ยืนยันการติดตั้ง แล้วเปิดผ่านไอคอนบนอุปกรณ์ได้เลย</span>
            </li>
          </ol>
        )}
        <p className="pwa-install-note">
          การเรียกช่าง รับงาน และส่งข้อความต้องเชื่อมต่ออินเทอร์เน็ต
        </p>
        <button
          type="button"
          className="pwa-dialog-done"
          onClick={() => dialog.current?.close()}
        >
          เข้าใจแล้ว
        </button>
      </dialog>
    </section>
  );
}
