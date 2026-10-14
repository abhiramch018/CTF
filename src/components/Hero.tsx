import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
import { phaseAtLeast, type IntroPhase, type MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { supportsWebGL } from "../lib/webgl.ts";
import { PortalFallback } from "./PortalFallback.tsx";
import { QuietControls } from "./QuietControls.tsx";
import { RegisterButton } from "./RegisterButton.tsx";
import { SceneErrorBoundary } from "./SceneErrorBoundary.tsx";

const VoxelScene = lazy(() => import("./VoxelScene.tsx"));

type JourneyRef = { current: SceneJourney };

type HeroProps = {
  phase: IntroPhase;
  instant: boolean;
  reducedMotion: boolean;
};

const GLYPHS = "01#/<>█▓░ABCDEF";

function cipherOf(text: string) {
  return "░".repeat(text.length);
}

function useDecoded(text: string, active: boolean, instant: boolean) {
  const [value, setValue] = useState(() => (instant ? text : cipherOf(text)));

  useEffect(() => {
    if (!active) return;
    if (instant) {
      setValue(text);
      return;
    }
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const locked = Math.min(text.length, Math.floor(step / 2));
      let next = "";
      for (let index = 0; index < text.length; index += 1) {
        if (index < locked) next += text[index];
        else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "0";
      }
      setValue(next);
      if (locked >= text.length) window.clearInterval(timer);
    }, 48);
    return () => window.clearInterval(timer);
  }, [active, instant, text]);

  if (!active) return cipherOf(text);
  return value;
}

function GlyphLine({ text, delay }: { text: string; delay: string }) {
  return (
    <span className="glyph-line" style={{ "--glyph-delay": delay } as CSSProperties} aria-hidden="true">
      {text}
    </span>
  );
}

type WorldStageProps = {
  motion: MotionRef;
  journey: JourneyRef;
  active: boolean;
  reducedMotion: boolean;
  scrollLive: boolean;
};

type SceneMode = "pending" | "webgl" | "css";

export function WorldStage({ motion, journey, active, reducedMotion, scrollLive }: WorldStageProps) {
  const [mode, setMode] = useState<SceneMode>(() => (supportsWebGL() ? "pending" : "css"));

  useEffect(() => {
    if (mode !== "pending") return;
    const timer = window.setTimeout(() => setMode((current) => (current === "pending" ? "css" : current)), 4500);
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle("webgl-live", mode === "webgl");
    return () => document.documentElement.classList.remove("webgl-live");
  }, [mode]);

  return (
    <div className={`world-layer${mode === "webgl" ? " is-live" : ""}`} aria-hidden="true">
      {mode !== "webgl" ? <PortalFallback animate={mode === "css" && !reducedMotion} /> : null}
      {mode !== "css" ? (
        <div className={`absolute inset-0 ${mode === "webgl" ? "opacity-100" : "opacity-0"}`}>
          <SceneErrorBoundary onError={() => setMode("css")} fallback={null}>
            <Suspense fallback={null}>
              <VoxelScene
                motion={motion}
                journey={journey}
                active={active}
                reducedMotion={reducedMotion}
                scrollLive={scrollLive}
                onReady={() => setMode("webgl")}
              />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}

export function Hero({ phase, instant, reducedMotion }: HeroProps) {
  const showTitle = instant || phaseAtLeast(phase, "title");
  const showDetails = instant || phaseAtLeast(phase, "details");
  const showCta = instant || phaseAtLeast(phase, "register");
  const dead = useDecoded("DEAD", showTitle, instant);
  const noctis = useDecoded("NOCTIS", showTitle, instant);
  const copyClass = [
    "hero-copy",
    phase === "done" ? "is-visible" : "",
    showTitle ? "show-title" : "",
    showDetails ? "show-details" : "",
    showCta ? "show-cta" : "",
    instant ? "is-instant" : "",
    reducedMotion ? "is-calm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id="top" className="chapter hero-sheet relative min-h-[100svh]">
      <div className="chapter-stage">
      <div className="hero-scrim" aria-hidden="true" />
      <div className={copyClass}>
        <p className="ghost-word ghost-word-hero" aria-hidden="true">
          NOCTIS
        </p>
        <div className="hero-stage">
          <div className="hero-zone hero-zone-center">
            <h1 id="hero-title" tabIndex={-1} className="hero-mark">
              <span className="portal-cast" aria-hidden="true" />
              <span className="sr-only">DEAD NOCTIS</span>
              <GlyphLine text={dead} delay="0s" />
              <GlyphLine text={noctis} delay="0.16s" />
            </h1>
            <p className="type-meta mt-5 text-cyan hero-detail delay-1">SEASON 01</p>
            <p className="type-kicker mt-4 max-w-xl hero-detail delay-2">
              NATIONAL-LEVEL CYBERSECURITY CAPTURE THE FLAG
            </p>
            <ol className="mission-coords hero-detail delay-3">
              <li>
                <span>06 DEC 2026</span>
                <strong>QUALIFIER</strong>
                <em>09:00–21:00 · 12H · REMOTE</em>
              </li>
              <li>
                <span>26–27 DEC 2026</span>
                <strong>FINALS</strong>
                <em>10:00 26 DEC – 16:00 27 DEC · KLEF</em>
              </li>
            </ol>
            <div className="hero-actions">
              <div
                className={`register-gate${showCta ? " is-live" : ""}${instant ? " is-instant" : ""}`}
                inert={showCta ? undefined : true}
                aria-hidden={showCta ? undefined : true}
                data-cta={showCta ? "live" : "waiting"}
              >
                <RegisterButton>ENTER THE ARENA</RegisterButton>
              </div>
              <button
                type="button"
                className="btn-ghost hero-detail delay-4"
                data-cursor="open"
                onClick={() =>
                  document.getElementById("challenges")?.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth",
                  })
                }
              >
                OPEN THE SECTORS
              </button>
            </div>
          </div>
          <div className="hero-zone hero-side">
            <p className="type-meta text-cyan">00 / ACCESS GATE</p>
            <p className="type-meta mt-8 text-muted">CTF · S01</p>
            <p className="type-small mt-3 max-w-[14rem] text-ink">
              KL University × Google Developer Groups × White Hat Hackers
            </p>
            <p className="terminal-line type-meta mt-8 text-neon">
              <span>CHANNEL OPEN</span>
              <span className="terminal-caret" aria-hidden="true" />
            </p>
            <p className="type-small mt-3 max-w-[14rem]">Remote qualifier. Finals at KLEF, Vaddeswaram.</p>
            <QuietControls />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
