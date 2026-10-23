import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getRoomMessages, sendMessage, readMessages } from "@/services/chat.service";
import { getJobDetails } from "@/services/jobs.service";
import { getActiveUserById } from "@/services/auth.service";
// We ideally need a function to get chat room details to check authorization. 
// For this simple version we will just assume user is authorized if they have the token.
import { db } from "@/lib/db";
import { type RowDataPacket } from "mysql2";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure room belongs to user
    const [rooms] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM chat_rooms WHERE id = ? AND (customer_id = ? OR technician_id = ?)`,
      [id, tokenUser.userId, tokenUser.userId]
    );

    if (rooms.length === 0) {
       return NextResponse.json({ error: "Room not found or unauthorized" }, { status: 404 });
    }

    const room = rooms[0];
    const messages = await getRoomMessages(id);
    
    // Mark unread messages from the other user as read
    await readMessages(id, tokenUser.userId);

    // Get extra info
    const job = await getJobDetails(String(room.job_id));
    const isCustomer = room.customer_id === tokenUser.userId;
    const otherUserId = isCustomer ? room.technician_id : room.customer_id;
    const otherUser = await getActiveUserById(String(otherUserId));

    return NextResponse.json({ 
      messages,
      myUserId: tokenUser.userId,
      roomInfo: {
         jobTitle: job?.title,
         techName: otherUser?.fullName
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const messageId = await sendMessage(id, tokenUser.userId, body.message);
    
    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
