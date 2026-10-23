import Link from "next/link";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { Brand } from "@/components/Brand";
import { LoginForm } from "./login-form";
export const metadata = { title: "เข้าสู่ระบบ | ThunderFix" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string }>;
}) {
  const { join } = await searchParams;
  return (
    <main className="auth-page">
      <div className="auth-brand-panel">
        <Brand />
        <div>
          <p className="eyebrow">YOUR NEIGHBOURHOOD FIX.</p>
          <h1>
            เรื่องช่าง
            <br />
            ใกล้แค่นี้<span>.</span>
          </h1>
          <p>
            พบช่างที่พร้อมดูแลบ้านของคุณ
            <br />
            หรือเริ่มรับงานใกล้บ้านด้วยฝีมือของคุณเอง
          </p>
          <ul>
            <li>
              <Check size={18} /> เรียกช่างด่วนในพื้นที่
            </li>
            <li>
              <Check size={18} /> เปรียบเทียบข้อเสนอก่อนตัดสินใจ
            </li>
            <li>
              <Check size={18} /> คุยและติดตามงานในที่เดียว
            </li>
          </ul>
        </div>
        <span className="auth-bottom">THUNDERFIX · บ้านพร้อม ชีวิตก็พร้อม</span>
        <Zap className="auth-watermark" strokeWidth={0.7} />
      </div>
      <div className="auth-form-panel">
        <Link href="/" className="text-link">
          <ArrowLeft size={16} /> กลับหน้าแรก
        </Link>
        <LoginForm joiningAsTechnician={join === "technician"} />
      </div>
    </main>
  );
}
