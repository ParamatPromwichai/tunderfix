"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function SubmitProfileButton({
  themeColor = "amber",
}: {
  themeColor?: "emerald" | "sky" | "amber";
}) {
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const [successDismissed, setSuccessDismissed] = useState(false);
  const showSuccess = searchParams.get("success") === "true";
  const isSuccess = showSuccess && !successDismissed;
  const errorCode = searchParams.get("error");
  const errors: Record<string, string> = {
    "avatar-type":
      "รองรับรูปภาพ JPG, PNG, WebP และ GIF เท่านั้น กรุณาเลือกรูปใหม่",
    "avatar-size": "รูปภาพต้องมีขนาดไม่เกิน 3 MB กรุณาเลือกรูปใหม่",
    "avatar-upload": "อัปโหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง",
    "profile-save": "บันทึกข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง",
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setSuccessDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const baseColor =
    themeColor === "amber"
      ? "bg-orange-700 hover:bg-orange-800"
      : themeColor === "emerald"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-sky-600 hover:bg-sky-700";

  return (
    <>
      {errorCode && errors[errorCode] && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {errors[errorCode]}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`px-6 py-2.5 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 ${isSuccess ? "bg-stone-800 hover:bg-stone-900" : baseColor}`}
      >
        {pending ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            กำลังบันทึก...
          </>
        ) : isSuccess ? (
          <>
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            บันทึกแล้ว!
          </>
        ) : (
          "บันทึกการเปลี่ยนแปลง"
        )}
      </button>
    </>
  );
}
