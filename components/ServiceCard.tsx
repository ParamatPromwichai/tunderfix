"use client";

import { useState } from "react";
import type { TechnicianService } from "@/repositories/technician-services.repository";

const inputCls =
  "w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5";

export function ServiceCard({ service }: { service: TechnicianService }) {
  const [isEditing, setIsEditing] = useState(false);
  const name = service.categoryName || `หมวดหมู่ #${service.categoryId}`;

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-stone-900 bg-white p-4 shadow-lg shadow-stone-900/10 animate-in fade-in">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Editing</p>
            <h3 className="font-black text-stone-900">{name}</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="h-8 w-8 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-center transition"
            aria-label="ยกเลิก"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form action={`/api/technician/services/${service.id}/update`} method="POST" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="ราคาเริ่มต้น (฿)">
              <input type="number" name="priceMin" defaultValue={service.priceMin || ""} className={inputCls} />
            </Field>
            <Field label="ราคาสูงสุด (฿)">
              <input type="number" name="priceMax" defaultValue={service.priceMax || ""} className={inputCls} />
            </Field>
          </div>
          <Field label="ประสบการณ์ (ปี)">
            <input type="number" name="experienceYears" defaultValue={service.experienceYears || ""} className={inputCls} />
          </Field>
          <Field label="ขอบเขตงาน">
            <textarea
              name="description"
              defaultValue={service.description || ""}
              rows={3}
              className={`${inputCls} h-auto py-2.5 resize-none`}
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 h-11 rounded-xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50 transition">
              ยกเลิก
            </button>
            <button type="submit" className="flex-[2] h-11 rounded-xl bg-stone-950 text-sm font-bold text-white hover:bg-stone-800 active:scale-[0.98] transition">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    );
  }

  const hasPrice = service.priceMin || service.priceMax;

  return (
    <article className="group rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:ring-amber-300/70 hover:shadow-md hover:shadow-stone-900/5">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base font-black text-amber-600 ring-1 ring-amber-100">
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-stone-900">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            เปิดรับงาน
            {service.experienceYears != null && (
              <>
                <span className="text-stone-300">·</span>
                ประสบการณ์ {service.experienceYears} ปี
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-70 transition group-hover:opacity-100">
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="แก้ไข"
            title="แก้ไข"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <form
            action={`/api/technician/services/${service.id}/delete`}
            method="POST"
            onSubmit={(e) => {
              if (!confirm(`ลบบริการ "${name}" ?`)) e.preventDefault();
            }}
          >
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label="ลบ"
              title="ลบ"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </form>
        </div>
      </div>

      {/* Scope */}
      {service.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{service.description}</p>
      ) : (
        <p className="mt-3 text-xs italic text-stone-400">ยังไม่ระบุขอบเขตงาน</p>
      )}

      {/* Price */}
      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
        <span className="text-xs text-stone-400">ช่วงราคา</span>
        {hasPrice ? (
          <span className="text-[15px] font-bold tabular-nums text-stone-900">
            ฿{service.priceMin?.toLocaleString() || 0}
            <span className="mx-1 font-normal text-stone-300">–</span>
            {service.priceMax ? service.priceMax.toLocaleString() : "ไม่จำกัด"}
          </span>
        ) : (
          <span className="text-sm font-semibold text-amber-600">ประเมินหน้างาน</span>
        )}
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-stone-500">{label}</span>
      {children}
    </label>
  );
}
