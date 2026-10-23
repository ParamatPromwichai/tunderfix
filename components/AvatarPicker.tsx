"use client";

import { useState, useRef } from "react";
import { Camera, Trash2 } from "lucide-react";

export function AvatarPicker({
  defaultUrl,
  defaultSeed,
}: {
  defaultUrl?: string | null;
  defaultSeed: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=0284c7&textColor=ffffff`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-stone-100">
      <div
        className="relative shrink-0 group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={previewUrl || fallbackUrl}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-stone-100"
        />
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-lg text-stone-900">รูปโปรไฟล์</h2>
        <p className="mobile-optional-copy text-sm text-stone-500 mb-3">
          รูปภาพนี้จะแสดงให้ลูกค้าเห็นเมื่อค้นหา
          แนะนำให้ใช้รูปถ่ายหน้าตรงที่ชัดเจน
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="เปลี่ยนรูปโปรไฟล์"
            title="เปลี่ยนรูปโปรไฟล์"
            className="mobile-icon-action text-sm font-medium bg-sky-50 text-sky-700 px-4 py-2 rounded-lg hover:bg-sky-100 transition"
          >
            <Camera size={20} className="mobile-command-icon" />
            <span className="mobile-command-label">เปลี่ยนรูปภาพ</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            aria-label="ลบรูปโปรไฟล์"
            title="ลบรูปโปรไฟล์"
            className="mobile-icon-action text-sm font-medium text-stone-500 px-4 py-2 hover:bg-stone-50 rounded-lg transition"
          >
            <Trash2 size={20} className="mobile-command-icon" />
            <span className="mobile-command-label">ลบ</span>
          </button>
        </div>
      </div>
      <input
        type="file"
        name="avatarFile"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {previewUrl === null && defaultUrl && (
        <input type="hidden" name="removeAvatar" value="true" />
      )}
    </div>
  );
}
