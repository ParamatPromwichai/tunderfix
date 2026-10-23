"use server";

import { getActiveUserById } from "@/services/auth.service";

export async function getTechnicianNameAction(technicianId: string) {
  const user = await getActiveUserById(technicianId);
  return user?.fullName || "ช่างซ่อม";
}
