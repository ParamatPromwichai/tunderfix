"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReviewJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      router.push(`/dashboard/customer/jobs/${jobId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500 mt-10">
      <header className="text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">
          ให้คะแนนช่างและบริการ
        </h1>
        <p className="text-stone-500 mt-1">
          ความคิดเห็นของคุณช่วยให้ช่างพัฒนาการบริการให้ดียิ่งขึ้น
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-8"
      >
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-center text-sm font-semibold text-stone-700 mb-4">
            ให้คะแนนความพึงพอใจ
          </label>
          <div
            className="flex justify-center gap-2"
            role="group"
            aria-label="คะแนนความพึงพอใจ"
            onPointerLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} ดาว`}
                aria-pressed={rating === star}
                onPointerEnter={() => setHoverRating(star)}
                onFocus={() => setHoverRating(star)}
                onBlur={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="rounded-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-orange-700 focus-visible:outline-offset-4"
              >
                <svg
                  className={`w-12 h-12 ${displayRating >= star ? "text-amber-400" : "text-stone-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-stone-500 text-sm font-medium">
            {displayRating === 1 && "ต้องปรับปรุงอย่างมาก"}
            {displayRating === 2 && "พอใช้"}
            {displayRating === 3 && "ปานกลาง"}
            {displayRating === 4 && "ดี"}
            {displayRating === 5 && "ยอดเยี่ยม!"}
          </div>
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="block text-sm font-semibold text-stone-700 mb-2"
          >
            ความคิดเห็นเพิ่มเติม (ถ้ามี)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="ประทับใจอะไร หรืออยากให้ปรับปรุงส่วนไหน พิมพ์ได้เลย"
            className="w-full rounded-lg border border-stone-300 p-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-70"
          >
            {loading ? "กำลังบันทึก..." : "ส่งรีวิว"}
          </button>
        </div>
      </form>
    </div>
  );
}
