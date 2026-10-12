import { lazy, Suspense, useEffect, useState } from "react";
import type { MotionRef } from "../hooks/useIntroController.ts";
import type { SceneJourney } from "../hooks/useScrollJourney.ts";
import { supportsWebGL } from "../lib/webgl.ts";
import { PortalFallback } from "./PortalFallback.tsx";
import { RegisterButton } from "./RegisterButton.tsx";
import { SceneErrorBoundary } from "./SceneErrorBoundary.tsx";

const VoxelScene = lazy(() => import("./VoxelScene.tsx"));

type JourneyRef = { current: SceneJourney };

type HeroProps = {
  settled: boolean;
  reducedMotion: boolean;
};

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

export function Hero({ settled, reducedMotion }: HeroProps) {
  return (
    <section id="top" className="hero-sheet relative min-h-[100svh]">
      <div className="hero-scrim" aria-hidden="true" />
      <div className={`hero-copy ${settled ? "is-visible" : ""}`}>
        <p className="type-meta text-neon">
          KL UNIVERSITY × GOOGLE DEVELOPER GROUPS × WHITE HAT HACKERS
        </p>
        <h1 id="hero-title" tabIndex={-1} className="type-hero mt-5">
          <span className="block">DEAD NOCTIS</span>
          <span className="block text-neon">CTF</span>
        </h1>
        <p className="type-kicker mt-5 max-w-xl">
          NATIONAL-LEVEL CYBERSECURITY CAPTURE THE FLAG
        </p>
        <p className="type-meta mt-3 text-muted">SEASON 01 // ENTER THE DIMENSION</p>
        <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="border border-obsidian bg-void/70 p-4">
            <p className="type-meta text-neon">06 DECEMBER 2026</p>
            <p className="type-card mt-2">ONLINE QUALIFIER</p>
            <p className="type-small mt-1">9 AM – 9 PM · 12 HOURS</p>
          </div>
          <div className="border border-obsidian bg-void/70 p-4">
            <p className="type-meta text-neon">26–27 DECEMBER 2026</p>
            <p className="type-card mt-2">OFFLINE FINALS</p>
            <p className="type-small mt-1">KLEF CAMPUS</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <RegisterButton>ENTER THE DIMENSION</RegisterButton>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              document.getElementById("challenges")?.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
              })
            }
          >
            EXPLORE THE GRID
          </button>
        </div>
      </div>
    </section>
  );
}
