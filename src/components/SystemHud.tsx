import { useEffect, useRef, useState } from "react";
import { setLite, setSound, stopSignal } from "../lib/signal.ts";
import { MissionTerminal } from "./MissionTerminal.tsx";

const chapters = [
  { id: "top", label: "ACCESS GATE" },
  { id: "overview", label: "THE MISSION" },
  { id: "challenges", label: "CHALLENGE SECTORS" },
  { id: "competition", label: "THE PROTOCOL" },
  { id: "rewards", label: "THE VAULT" },
  { id: "register", label: "FINAL ACCESS" },
];

export function SystemHud() {
  const chapter = useRef<HTMLParagraphElement>(null);
  const progress = useRef<HTMLParagraphElement>(null);
  const [sound, setSoundOn] = useState(false);
  const [lite, setLiteOn] = useState(false);
  const [terminal, setTerminal] = useState(false);

  useEffect(() => {
    let frame = 0;
    let lastChapter = "";
    let lastProgress = "";
    const tick = () => {
      frame = 0;
      const mark = window.innerHeight * 0.34;
      let label = chapters[0].label;
      for (const item of chapters) {
        const node = document.getElementById(item.id);
        if (node && node.getBoundingClientRect().top <= mark) label = item.label;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? `${Math.min(100, Math.round((window.scrollY / max) * 100))}%` : "0%";
      if (chapter.current && label !== lastChapter) {
        lastChapter = label;
        chapter.current.textContent = label;
      }
      if (progress.current && percent !== lastProgress) {
        lastProgress = percent;
        progress.current.textContent = percent;
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      stopSignal();
    };
  }, []);

  return (
    <>
      <aside className="system-hud" aria-label="System status">
        <p ref={chapter} className="type-meta text-neon">
          ACCESS GATE
        </p>
        <p className="type-meta text-muted">
          SCROLL <span ref={progress}>0%</span>
        </p>
        <p className="type-meta text-cyan">QUALIFIER 6 DEC 2026</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="hud-button"
            aria-pressed={sound}
            onClick={() => {
              const next = !sound;
              setSoundOn(next);
              setSound(next);
            }}
          >
            SOUND {sound ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            className="hud-button"
            aria-pressed={lite}
            onClick={() => {
              const next = !lite;
              setLiteOn(next);
              setLite(next);
            }}
          >
            {lite ? "FULL FX" : "LITE FX"}
          </button>
          <button type="button" className="hud-button" onClick={() => setTerminal(true)}>
            TERMINAL
          </button>
        </div>
      </aside>
      <MissionTerminal open={terminal} onClose={() => setTerminal(false)} />
    </>
  );
}
