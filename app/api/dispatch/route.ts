import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import {
  coordinatesSchema,
  urgentJobSchema,
  offerSchema,
} from "@/lib/dispatch";
import {
  getDispatchSnapshot,
  publishUrgentJob,
  setPresence,
  submitUrgentOffer,
  chooseUrgentOffer,
  cancelUrgentJob,
  progressJob,
  DispatchError,
} from "@/services/dispatch.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function actor() {
  const token = await getAuthUserFromCookies();
  if (!token) throw new DispatchError("กรุณาเข้าสู่ระบบ", 401);
  const user = await getActiveUserById(token.userId);
  if (!user || (user.role !== "customer" && user.role !== "technician"))
    throw new DispatchError("บัญชีนี้ไม่สามารถใช้งานได้", 403);
  return { id: user.id, role: user.role as "customer" | "technician" };
}
function failure(error: unknown) {
  if (error instanceof DispatchError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return NextResponse.json(
      {
        error:
          "กรุณาตรวจสอบข้อมูลให้ครบถ้วน ราคาและเวลาต้องเป็นตัวเลขที่ถูกต้อง",
      },
      { status: 400 },
    );
  console.error("[dispatch]", error);
  return NextResponse.json(
    { error: "ระบบเรียกด่วนยังเชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง" },
    { status: 503 },
  );
}
export async function GET() {
  try {
    const u = await actor();
    return NextResponse.json(await getDispatchSnapshot(u.id, u.role), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      throw new DispatchError("คำขอไม่ถูกต้อง", 403);
    const u = await actor();
    const body = z
      .object({ action: z.string() })
      .passthrough()
      .parse(await request.json());
    if (body.action === "publish" && u.role === "customer")
      return NextResponse.json(
        { jobId: await publishUrgentJob(u.id, urgentJobSchema.parse(body)) },
        { status: 201 },
      );
    if (body.action === "presence" && u.role === "technician") {
      const input = coordinatesSchema
        .extend({ online: z.boolean() })
        .parse(body);
      await setPresence(u.id, input);
      return NextResponse.json({ success: true });
    }
    if (body.action === "offer" && u.role === "technician") {
      await submitUrgentOffer(u.id, offerSchema.parse(body));
      return NextResponse.json({ success: true });
    }
    if (body.action === "progress" && u.role === "technician") {
      const input = z
        .object({
          jobId: z.string().regex(/^\d+$/),
          status: z.enum(["on_the_way", "in_progress"]),
        })
        .parse(body);
      await progressJob(u.id, input.jobId, input.status);
      return NextResponse.json({ success: true });
    }
    const selection = z.object({
      jobId: z.string().regex(/^\d+$/),
      offerId: z.string().regex(/^\d+$/).optional(),
    });
    if (body.action === "choose" && u.role === "customer") {
      const input = selection.required().parse(body);
      return NextResponse.json(
        await chooseUrgentOffer(u.id, input.jobId, input.offerId),
      );
    }
    if (body.action === "cancel" && u.role === "customer") {
      const input = selection.parse(body);
      await cancelUrgentJob(u.id, input.jobId);
      return NextResponse.json({ success: true });
    }
    throw new DispatchError("ไม่สามารถทำรายการนี้ได้", 403);
  } catch (error) {
    return failure(error);
  }
}
