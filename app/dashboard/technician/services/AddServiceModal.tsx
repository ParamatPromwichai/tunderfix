"use client";

import { useEffect, useId, useRef, useState } from "react";

const inputCls =
  "w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5";

export function AddServiceModal({ allCategories }: { allCategories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backdropPressed = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  function isOutside(
    event:
      | React.MouseEvent<HTMLDialogElement>
      | React.PointerEvent<HTMLDialogElement>,
  ) {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }

  return (
    <>
      {/* + Button */}
      <button
        id="add-service-btn"
        ref={triggerRef}
        type="button"
        aria-label="เพิ่มบริการ"
        onClick={() => setIsOpen(true)}
        className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300 active:scale-90"
      >
        <svg
          className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M12 5v14m7-7H5"
          />
        </svg>
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onCancel={() => setIsOpen(false)}
          onClose={(event) => {
            if (
              event.currentTarget === dialogRef.current &&
              !event.currentTarget.open
            )
              setIsOpen(false);
          }}
          onPointerDown={(event) => {
            backdropPressed.current = isOutside(event);
          }}
          onClick={(event) => {
            if (backdropPressed.current && isOutside(event)) setIsOpen(false);
            backdropPressed.current = false;
          }}
          className="service-add-dialog overflow-y-auto bg-white shadow-2xl"
        >
          {/* Handle */}
          <div className="sticky top-0 z-10 bg-white pt-2.5 sm:hidden">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-200" />
          </div>

          {/* Header */}
          <div className="service-modal-heading flex items-start justify-between px-5 pt-4 pb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                New Service
              </p>
              <h2 id={titleId} className="text-xl font-black text-stone-900">
                เพิ่มงานที่รับ
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="ปิด"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-6">
            <form
              id="add-service-form"
              action="/api/technician/services"
              method="POST"
              className="space-y-3 pt-2"
            >
              <Field label="หมวดหมู่งาน">
                <div className="relative">
                  <select
                    name="categoryId"
                    required
                    className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="ราคาเริ่มต้น (฿)">
                  <input
                    type="number"
                    name="priceMin"
                    placeholder="500"
                    className={inputCls}
                  />
                </Field>
                <Field label="ราคาสูงสุด (฿)">
                  <input
                    type="number"
                    name="priceMax"
                    placeholder="2,000"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="ประสบการณ์ (ปี)">
                <input
                  type="number"
                  name="experienceYears"
                  placeholder="5"
                  className={inputCls}
                />
              </Field>

              <Field label="ขอบเขตงาน">
                <textarea
                  name="description"
                  rows={3}
                  placeholder="เช่น ล้างแอร์, เติมน้ำยา, ซ่อมคอมเพรสเซอร์"
                  className={`${inputCls} h-auto py-3 resize-none`}
                />
              </Field>

              <button
                type="submit"
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-950 text-sm font-bold text-white transition hover:bg-stone-800 active:scale-[0.98]"
              >
                บันทึกบริการ
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>

            {/* Add category */}
            <div className="mt-5 rounded-2xl bg-stone-50 p-3">
              <p className="mb-2 text-xs font-bold text-stone-500">
                ไม่เจอหมวดหมู่ที่ต้องการ?
              </p>
              <form
                action="/api/categories"
                method="POST"
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="ชื่อหมวดหมู่ใหม่"
                  className="h-10 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium outline-none transition focus:border-stone-900"
                />
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-amber-400 px-4 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
                >
                  เพิ่ม
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}
