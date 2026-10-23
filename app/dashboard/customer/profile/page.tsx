import { getAuthUserFromCookies } from "@/lib/auth";
import { getUserProfile } from "@/services/users.service";
import { redirect } from "next/navigation";
import { MapPicker } from "@/components/MapPicker";
import { SubmitProfileButton } from "@/components/SubmitProfileButton";
import { AvatarPicker } from "@/components/AvatarPicker";
import { InstallAppCard } from "@/components/InstallAppCard";
import { Card, PageHeader, inputCls } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-stone-500">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export default async function CustomerProfilePage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const profile = await getUserProfile(tokenUser.userId);
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl pb-24 animate-in fade-in duration-300">
      <form
        action="/api/profile"
        method="POST"
        encType="multipart/form-data"
        className="space-y-4"
      >
        <PageHeader
          title="โปรไฟล์"
          subtitle="ข้อมูลส่วนตัวและที่อยู่สำหรับช่าง"
        />

        <Card className="p-4 md:p-6">
          <AvatarPicker
            defaultUrl={profile.avatarUrl}
            defaultSeed={profile.fullName}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Field label="ชื่อ - นามสกุล" required>
              <input
                type="text"
                name="fullName"
                required
                defaultValue={profile.fullName}
                className={inputCls}
              />
            </Field>
            <Field label="เบอร์โทรศัพท์">
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone || ""}
                className={inputCls}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-3 p-4 md:p-6">
          <h2 className="text-sm font-bold text-stone-900">
            ที่อยู่ (สำหรับช่างเข้าพื้นที่)
          </h2>
          <Field label="รายละเอียดที่อยู่">
            <textarea
              name="addressText"
              rows={2}
              defaultValue={profile.addressText || ""}
              placeholder="บ้านเลขที่ ซอย ถนน แขวง เขต"
              className={`${inputCls} h-auto resize-none py-2.5`}
            />
          </Field>
          <div>
            <span className="mb-1 block text-[11px] font-bold text-stone-500">
              ปักหมุดบนแผนที่
            </span>
            <div className="overflow-hidden rounded-xl ring-1 ring-stone-200">
              <MapPicker
                initialLat={profile.latitude || 13.7563}
                initialLng={profile.longitude || 100.5018}
              />
            </div>
          </div>
        </Card>

        <SubmitProfileButton themeColor="amber" />
      </form>
      <div className="mt-5">
        <InstallAppCard />
      </div>
    </div>
  );
}
