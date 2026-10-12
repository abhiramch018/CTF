import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";

export const INTRO_STORAGE_KEY = "dead-noctis-s01-intro";

export type IntroPhase = "void" | "portal" | "title" | "transition" | "done";

export type SceneMotion = {
  x: number;
  y: number;
  z: number;
  lookY: number;
  intensity: number;
  particles: number;
  drift: number;
};

export type MotionRef = RefObject<SceneMotion>;

export function heroMotion(reducedMotion: boolean): SceneMotion {
  return {
    x: 0,
    y: 1.86,
    z: 7.45,
    lookY: 2.45,
    intensity: 1,
    particles: reducedMotion ? 0 : 1,
    drift: reducedMotion ? 0 : 1,
  };
}

function distantMotion(): SceneMotion {
  return {
    x: 0,
    y: 2.4,
    z: 12.5,
    lookY: 2.55,
    intensity: 0.05,
    particles: 0.15,
    drift: 0,
  };
}

function applyMotion(target: SceneMotion, next: SceneMotion) {
  target.x = next.x;
  target.y = next.y;
  target.z = next.z;
  target.lookY = next.lookY;
  target.intensity = next.intensity;
  target.particles = next.particles;
  target.drift = next.drift;
}

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useIntroController(reducedMotion: boolean) {
  const seen = introAlreadySeen();
  const motion = useRef<SceneMotion>(seen || reducedMotion ? heroMotion(reducedMotion) : distantMotion());
  const [phase, setPhase] = useState<IntroPhase>(seen ? "done" : reducedMotion ? "title" : "void");
  const [overlay, setOverlay] = useState(!seen);
  const finished = useRef(seen);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const safetyRef = useRef(0);
  const fadeRef = useRef(0);
  const reducedRef = useRef(reducedMotion);
  const startedReduced = useRef(reducedMotion);
  const alive = useRef(true);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    window.clearTimeout(safetyRef.current);
    window.clearTimeout(fadeRef.current);
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Private browsing can block storage. The intro still ends.
    }
    applyMotion(motion.current, heroMotion(reducedRef.current));
    if (!alive.current) return;
    setPhase("done");
    setOverlay(false);
    document.body.classList.remove("intro-lock");
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (finished.current || introAlreadySeen()) return;

    document.body.classList.add("intro-lock");

    if (reducedRef.current) {
      fadeRef.current = window.setTimeout(finish, 700);
      return () => {
        window.clearTimeout(fadeRef.current);
        document.body.classList.remove("intro-lock");
      };
    }

    const mark = (next: IntroPhase, at: number) => {
      timeline.call(
        () => {
          if (alive.current) setPhase(next);
        },
        [],
        at,
      );
    };

    const timeline = gsap.timeline({ onComplete: finish });
    timelineRef.current = timeline;
    timeline.to(
      motion.current,
      { intensity: 0.4, particles: 0.55, z: 10.5, duration: 1.15, ease: "power1.out" },
      0,
    );
    mark("portal", 1.15);
    timeline.to(
      motion.current,
      { intensity: 1, particles: 1, z: 8.25, y: 2.02, duration: 1.6, ease: "power2.inOut" },
      1.15,
    );
    mark("title", 2.45);
    mark("transition", 4.3);
    timeline.to(motion.current, { z: 7.45, y: 1.86, duration: 1.15, ease: "power2.inOut" }, 4.3);
    timeline.call(
      () => {
        motion.current.drift = reducedRef.current ? 0 : 1;
      },
      [],
      5.35,
    );
    timeline.to({}, { duration: 0.35 }, 5.4);
    safetyRef.current = window.setTimeout(finish, 8000);

    return () => {
      timeline.kill();
      window.clearTimeout(safetyRef.current);
      document.body.classList.remove("intro-lock");
    };
  }, [finish]);

  useEffect(() => {
    if (!reducedMotion || startedReduced.current || finished.current) return;
    finish();
  }, [reducedMotion, finish]);

  return { phase, overlay, motion, skip: finish };
}
