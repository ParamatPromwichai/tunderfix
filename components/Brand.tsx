import Link from "next/link";
import { Zap } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="ThunderFix หน้าแรก">
      <span className="brand-mark">
        <Zap size={23} fill="currentColor" strokeWidth={1.5} />
      </span>
      <span>
        <strong>
          thunder<span>fix</span>
          <i>.</i>
        </strong>
        {!compact && <small>เรื่องช่าง ใกล้แค่นี้</small>}
      </span>
    </Link>
  );
}
