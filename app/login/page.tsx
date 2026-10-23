import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "เข้าสู่ระบบ | ThunderFix",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-200">
      
      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-stone-200/60 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-amber-300 to-amber-500 p-12 overflow-hidden">
          {/* Abstract Wavy Shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] text-white" fill="currentColor">
              <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" />
            </svg>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] text-amber-600 opacity-30" fill="currentColor">
              <path d="M0,40 Q30,80 60,40 T100,60 L100,100 L0,100 Z" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center">
            <Link className="inline-flex flex-col items-center gap-4 hover:scale-105 transition-transform" href="/">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl font-black text-amber-500 shadow-xl shadow-amber-600/20">
                TF
              </span>
              <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">ThunderFix</span>
            </Link>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white">
          <LoginForm />
        </div>
        
      </div>
      
    </main>
  );
}
