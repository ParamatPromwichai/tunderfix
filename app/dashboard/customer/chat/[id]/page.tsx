"use client";
// Using a client component for chat UI to allow periodic polling or future websocket integration

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export default function ChatRoomClient() {
  const params = useParams();
  const roomId = params.id as string;
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [roomInfo, setRoomInfo] = useState<{ jobTitle?: string, techName?: string } | null>(null);
  
  // We don't have current user id from token here directly unless fetched, assuming standard implementation 
  // For demo, we just rely on senderId from messages to format left/right (or we fetch user info)
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/customer/chat/${roomId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setRoomInfo(data.roomInfo);
        setMyUserId(data.myUserId);
        
        // Refresh the router to update navbar badges (since they are server components)
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // In a real app we'd use WebSockets. Here we poll every 5s for simplicity
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/customer/chat/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText }),
      });
      if (res.ok) {
        setInputText("");
        await fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500">กำลังโหลดข้อความ...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-in fade-in duration-500">
      <header className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/customer/chat')} className="text-stone-500 hover:text-stone-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                {roomInfo?.techName?.charAt(0) || 'T'}
             </div>
             <div>
               <h2 className="font-bold text-stone-900">{roomInfo?.techName || 'ช่างซ่อม'}</h2>
               <p className="text-xs text-stone-500 truncate max-w-[200px] sm:max-w-xs">{roomInfo?.jobTitle}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400">
            <p>ยังไม่มีข้อความ</p>
            <p className="text-sm">พิมพ์ข้อความเพื่อเริ่มการสนทนา</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === myUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                  isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-900 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-stone-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความ..." 
            className="flex-1 h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || sending}
            className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-50"
          >
            ส่ง
          </button>
        </form>
      </div>
    </div>
  );
}
