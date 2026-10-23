"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Link from "next/link";

type Mode = "login" | "register";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; details?: Record<string, string[]> } };

function getErrorMessage(response: ApiResponse<unknown>): string {
  if (response.success) return "";
  const firstFieldError = response.error.details ? Object.values(response.error.details).flat()[0] : undefined;
  return firstFieldError || response.error.message;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          }
        : {
            fullName: String(formData.get("fullName") || ""),
            email: String(formData.get("email") || ""),
            phone: String(formData.get("phone") || "") || null,
            password: String(formData.get("password") || ""),
            role: String(formData.get("role") || "customer"),
            latitude: 13.736717,
            longitude: 100.523186,
          };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || !result.success) {
        setMessage(getErrorMessage(result));
        return;
      }
      const data = result as { success: boolean; data?: { user?: { role: string } } };
      
      if (data.data?.user?.role === "customer") {
        router.push("/dashboard/customer/explore");
      } else if (data.data?.user?.role === "technician") {
        router.push("/dashboard/technician");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="w-full relative min-h-[480px]">
      
      {/* Mobile Logo (Visible only on small screens) */}
      <div className="lg:hidden flex flex-col items-center justify-center mb-8">
        <Link className="inline-flex flex-col items-center gap-2 hover:scale-105 transition-transform" href="/">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-xl font-black text-stone-950 shadow-md shadow-amber-500/20">
            TF
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-stone-900">ThunderFix</span>
        </Link>
      </div>

      <div className="text-center mb-8 transition-all duration-300">
        <h2 className="text-3xl font-bold text-amber-500 mb-2">
          {isLogin ? "Welcome" : "Sign Up"}
        </h2>
        <p className="text-stone-400 text-sm">
          {isLogin ? "Login to your account to continue" : "Hello, Create Your Account"}
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 text-center animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative overflow-hidden w-full transition-all duration-500" style={{ height: isLogin ? "180px" : "360px" }}>
          
          {/* LOGIN FORM */}
          <div 
            className="absolute inset-x-0 top-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ 
              opacity: isLogin ? 1 : 0, 
              transform: isLogin ? "translateX(0)" : "translateX(-120%)",
              pointerEvents: isLogin ? "auto" : "none"
            }}
          >
            <div className="space-y-4 px-2">
              <input
                className="block w-full h-14 rounded-full border border-stone-200/50 bg-stone-100/70 px-6 text-sm text-center outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400 font-medium disabled:opacity-50"
                name="email"
                placeholder="Email"
                type="email"
                required={isLogin}
                disabled={!isLogin}
              />
              <input
                className="block w-full h-14 rounded-full border border-stone-200/50 bg-stone-100/70 px-6 text-sm text-center outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400 font-medium disabled:opacity-50"
                name="password"
                placeholder="Password"
                type="password"
                required={isLogin}
                disabled={!isLogin}
              />
              <div className="text-right px-4 pt-1">
                <a href="#" className="text-xs text-stone-400 hover:text-amber-500 transition-colors">Forgot your password?</a>
              </div>
            </div>
          </div>

          {/* REGISTER FORM */}
          <div 
            className="absolute inset-x-0 top-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ 
              opacity: !isLogin ? 1 : 0, 
              transform: !isLogin ? "translateX(0)" : "translateX(120%)",
              pointerEvents: !isLogin ? "auto" : "none"
            }}
          >
            <div className="space-y-4 px-2">
              <input
                className="block w-full h-14 rounded-full border border-stone-200/50 bg-stone-100/70 px-6 text-sm text-center outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400 font-medium disabled:opacity-50"
                name="fullName"
                placeholder="Full Name"
                required={!isLogin}
                disabled={isLogin}
              />
              <input
                className="block w-full h-14 rounded-full border border-stone-200/50 bg-stone-100/70 px-6 text-sm text-center outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400 font-medium disabled:opacity-50"
                name="email"
                type="email"
                placeholder="Email"
                required={!isLogin}
                disabled={isLogin}
              />
              <input
                className="block w-full h-14 rounded-full border border-stone-200/50 bg-stone-100/70 px-6 text-sm text-center outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 placeholder:text-stone-400 font-medium disabled:opacity-50"
                name="password"
                type="password"
                placeholder="Password (8+ chars)"
                minLength={8}
                required={!isLogin}
                disabled={isLogin}
              />

              <div className="flex justify-center items-center pt-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="role" value="customer" defaultChecked className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-stone-300" disabled={isLogin} />
                  <span className="text-xs text-stone-500 group-hover:text-stone-800 transition">Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="role" value="technician" className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-stone-300" disabled={isLogin} />
                  <span className="text-xs text-stone-500 group-hover:text-stone-800 transition">Technician</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            className="flex items-center justify-center h-12 w-40 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLogin ? "LOG IN" : "SIGN UP"}
          </button>
        </div>
      </form>

      {/* Toggle Links */}
      <div className="mt-10 text-center text-sm text-stone-500 transition-all duration-300">
        {isLogin ? (
          <p>
            Don't have an account?{" "}
            <button type="button" onClick={() => { setMode("register"); setMessage(null); }} className="text-amber-500 font-bold hover:underline underline-offset-4">
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button type="button" onClick={() => { setMode("login"); setMessage(null); }} className="text-amber-500 font-bold hover:underline underline-offset-4">
              Log In
            </button>
          </p>
        )}
      </div>

    </div>
  );
}
