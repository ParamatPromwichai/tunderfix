"use client";
import { useEffect } from "react";

export function InteractionEffects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const feedback = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        reduced.matches ||
        !(event.target instanceof Element)
      )
        return;
      const target = event.target.closest("button, a");
      if (
        !target ||
        target.closest(".leaflet-container") ||
        target.hasAttribute("disabled")
      )
        return;
      const ring = document.createElement("span");
      ring.className = "interaction-ring";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove(), {
        once: true,
      });
      setTimeout(() => ring.remove(), 650);
    };
    document.addEventListener("pointerdown", feedback, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", feedback);
      document
        .querySelectorAll(".interaction-ring")
        .forEach((ring) => ring.remove());
    };
  }, []);
  return null;
}
