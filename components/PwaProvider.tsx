"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { RefreshCw, WifiOff, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
type Platform = "standalone" | "ios" | "android" | "desktop";
type PwaState = {
  installed: boolean;
  platform: Platform;
  canPrompt: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
};
const PwaContext = createContext<PwaState | null>(null);

function subscribePlatform(callback: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function getPlatform(): Platform {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone || window.matchMedia("(display-mode: standalone)").matches)
    return "standalone";
  if (
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  )
    return "ios";
  return /Android/i.test(nav.userAgent) ? "android" : "desktop";
}
function subscribeNetwork(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const platform = useSyncExternalStore(
    subscribePlatform,
    getPlatform,
    () => "desktop" as Platform,
  );
  const online = useSyncExternalStore(
    subscribeNetwork,
    () => navigator.onLine,
    () => true,
  );
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [update, setUpdate] = useState<ServiceWorkerRegistration | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const reloadRequested = useRef(false);

  useEffect(() => {
    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setJustInstalled(true);
      setPrompt(null);
    };
    const onController = () => {
      if (reloadRequested.current) window.location.reload();
    };
    const checkUpdate = () => {
      if (document.visibilityState === "visible" && registration)
        void registration.update().catch(() => {});
    };
    const showUpdate = () => {
      if (
        !disposed &&
        registration?.waiting &&
        navigator.serviceWorker.controller
      ) {
        setUpdate(registration);
        setUpdateDismissed(false);
      }
    };
    let installing: ServiceWorker | null = null;
    const onState = () => {
      if (installing?.state === "installed") showUpdate();
    };
    const onUpdateFound = () => {
      installing?.removeEventListener("statechange", onState);
      installing = registration?.installing ?? null;
      installing?.addEventListener("statechange", onState);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator &&
      window.isSecureContext
    ) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onController,
      );
      document.addEventListener("visibilitychange", checkUpdate);
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((value) => {
          if (disposed) return;
          registration = value;
          showUpdate();
          registration.addEventListener("updatefound", onUpdateFound);
          onUpdateFound();
        })
        .catch(() => {
          console.warn("ThunderFix offline support could not be prepared.");
        });
    }
    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", checkUpdate);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        onController,
      );
      registration?.removeEventListener("updatefound", onUpdateFound);
      installing?.removeEventListener("statechange", onState);
    };
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return "unavailable" as const;
    setPrompt(null);
    try {
      await prompt.prompt();
      return (await prompt.userChoice).outcome;
    } catch {
      return "unavailable" as const;
    }
  }, [prompt]);

  const applyUpdate = () => {
    if (!update?.waiting) return;
    reloadRequested.current = true;
    update.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <PwaContext.Provider
      value={{
        platform,
        installed: platform === "standalone" || justInstalled,
        canPrompt: !!prompt,
        install,
      }}
    >
      {!online && (
        <div className="pwa-network-status" role="status">
          <WifiOff size={16} aria-hidden="true" /> ออฟไลน์ ·
          เชื่อมต่ออินเทอร์เน็ตเพื่อส่งข้อความและรับงาน
        </div>
      )}
      {children}
      {update && !updateDismissed && (
        <aside className="pwa-update" aria-label="อัปเดต ThunderFix">
          <RefreshCw size={20} aria-hidden="true" />
          <div>
            <strong>ThunderFix เวอร์ชันใหม่พร้อมแล้ว</strong>
            <span>กดอัปเดตเพื่อโหลดหน้าใหม่เมื่อคุณพร้อม</span>
          </div>
          <button type="button" onClick={applyUpdate}>
            อัปเดต
          </button>
          <button
            type="button"
            className="pwa-update-dismiss"
            onClick={() => setUpdateDismissed(true)}
            aria-label="อัปเดตภายหลัง"
          >
            <X size={18} />
          </button>
        </aside>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error("PWA controls must be inside PwaProvider");
  return context;
}
