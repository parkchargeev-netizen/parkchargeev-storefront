"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";

const idleTimeoutMs = 30 * 60 * 1000;
const warningWindowMs = 5 * 60 * 1000;
const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AdminSessionGuard() {
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const [remainingMs, setRemainingMs] = useState(idleTimeoutMs);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutForInactivity = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST"
      });
    } finally {
      router.push("/admin?reason=session_timeout");
      router.refresh();
    }
  }, [isLoggingOut, router]);

  function keepSessionVisible() {
    lastActivityRef.current = Date.now();
    setRemainingMs(idleTimeoutMs);
  }

  useEffect(() => {
    function markActivity() {
      lastActivityRef.current = Date.now();
    }

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const interval = window.setInterval(() => {
      const nextRemainingMs = idleTimeoutMs - (Date.now() - lastActivityRef.current);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        void logoutForInactivity();
      }
    }, 1000 * 15);

    return () => {
      window.clearInterval(interval);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [logoutForInactivity]);

  if (remainingMs > warningWindowMs || isLoggingOut) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-40 w-[min(92vw,420px)] rounded-lg border border-amber-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">Oturum zaman aşımına yaklaştı</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Hareketsizlik nedeniyle {formatRemaining(remainingMs)} sonra çıkış yapılacak.
          </p>
          <button
            type="button"
            onClick={keepSessionVisible}
            className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Çalışmaya devam et
          </button>
        </div>
      </div>
    </div>
  );
}
