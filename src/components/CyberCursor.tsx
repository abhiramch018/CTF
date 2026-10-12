import { useEffect, useRef } from "react";

type CyberCursorProps = {
  reducedMotion: boolean;
};

const labels: Record<string, string> = {
  enter: "ENTER",
  join: "JOIN",
  explore: "EXPLORE",
  link: "",
  view: "LOCK",
  idle: "",
};

export function CyberCursor({ reducedMotion }: CyberCursorProps) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-cursor");
    const point = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...point };
    const spotPos = { ...point };
    let mode = "idle";
    let magnet: HTMLElement | null = null;
    let frame = 0;

    const paintMode = (next: string) => {
      if (next === mode) return;
      mode = next;
      const node = ring.current;
      if (!node) return;
      node.dataset.mode = next;
      const label = node.querySelector("span");
      if (label) label.textContent = labels[next] ?? "";
    };

    const onMove = (event: PointerEvent) => {
      point.x = event.clientX;
      point.y = event.clientY;
      const element = event.target instanceof Element ? event.target : null;
      paintMode(element?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "idle");
      const nextMagnet = element?.closest("[data-magnetic]");
      if (magnet && magnet !== nextMagnet) magnet.style.transform = "";
      magnet = nextMagnet instanceof HTMLElement ? nextMagnet : null;
    };

    const onLeave = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };

    const loop = () => {
      ringPos.x += (point.x - ringPos.x) * 0.18;
      ringPos.y += (point.y - ringPos.y) * 0.18;
      spotPos.x += (point.x - spotPos.x) * 0.08;
      spotPos.y += (point.y - spotPos.y) * 0.08;
      if (dot.current) dot.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      if (spot.current) spot.current.style.transform = `translate3d(${spotPos.x}px, ${spotPos.y}px, 0)`;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const dx = Math.max(-12, Math.min(12, (point.x - (rect.left + rect.width / 2)) * 0.2));
        const dy = Math.max(-8, Math.min(8, (point.y - (rect.top + rect.height / 2)) * 0.2));
        magnet.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      frame = window.requestAnimationFrame(loop);
    };

    frame = window.requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (magnet) magnet.style.transform = "";
      document.documentElement.classList.remove("has-cursor");
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div ref={spot} className="cursor-spot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" data-mode="idle" aria-hidden="true">
        <span />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
