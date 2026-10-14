import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";

export const INTRO_STORAGE_KEY = "dead-noctis-s01-intro";

export type IntroPhase =
  | "void"
  | "portal"
  | "action"
  | "title"
  | "details"
  | "register"
  | "transition"
  | "done";

const PHASE_RANK: Record<IntroPhase, number> = {
  void: 0,
  portal: 1,
  action: 2,
  title: 3,
  details: 4,
  register: 5,
  transition: 6,
  done: 7,
};

export function phaseAtLeast(phase: IntroPhase, target: IntroPhase) {
  return PHASE_RANK[phase] >= PHASE_RANK[target];
}

export type SceneMotion = {
  x: number;
  y: number;
  z: number;
  lookY: number;
  intensity: number;
  particles: number;
  drift: number;
  action: number;
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
    action: 1,
  };
}

function distantMotion(): SceneMotion {
  return {
    x: 0,
    y: 2.4,
    z: 12.5,
    lookY: 2.55,
    intensity: 0.06,
    particles: 0.16,
    drift: 0,
    action: 0,
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
  target.action = next.action;
}

function simplifyIntro(reducedMotion: boolean) {
  if (reducedMotion || typeof window === "undefined") return reducedMotion;
  const narrow = window.matchMedia("(max-width: 760px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return narrow || (cores <= 4 && memory <= 4);
}

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberIntro() {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    // Private browsing can block storage. The intro still ends.
  }
}

export function useIntroController(reducedMotion: boolean) {
  const seen = introAlreadySeen();
  const bypass = seen || simplifyIntro(reducedMotion);
  const motion = useRef<SceneMotion>(bypass ? heroMotion(reducedMotion) : distantMotion());
  const [phase, setPhase] = useState<IntroPhase>(bypass ? "done" : "void");
  const [overlay, setOverlay] = useState(!bypass);
  const [cut, setCut] = useState(bypass);
  const finished = useRef(bypass);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const safetyRef = useRef(0);
  const reducedRef = useRef(reducedMotion);
  const startedReduced = useRef(reducedMotion);
  const alive = useRef(true);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const finish = useCallback((options?: { cut?: boolean }) => {
    if (finished.current) return;
    finished.current = true;
    timelineRef.current?.kill();
    timelineRef.current = null;
    window.clearTimeout(safetyRef.current);
    rememberIntro();
    applyMotion(motion.current, heroMotion(reducedRef.current));
    if (!alive.current) return;
    if (options?.cut) setCut(true);
    setPhase("done");
    setOverlay(false);
    document.body.classList.remove("intro-lock");
  }, []);

  const skip = useCallback(() => finish({ cut: true }), [finish]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!bypass) return;
    rememberIntro();
    document.body.classList.remove("intro-lock");
  }, [bypass]);

  useEffect(() => {
    if (finished.current || introAlreadySeen()) return;

    document.body.classList.add("intro-lock");

    const mark = (next: IntroPhase, at: number) => {
      timeline.call(
        () => {
          if (alive.current) setPhase(next);
        },
        [],
        at,
      );
    };

    const timeline = gsap.timeline({ onComplete: () => finish() });
    timelineRef.current = timeline;
    timeline.to(
      motion.current,
      { intensity: 0.28, particles: 0.28, z: 10.4, y: 2.18, lookY: 2.5, duration: 0.45, ease: "power1.out" },
      0,
    );
    mark("portal", 0.4);
    timeline.to(
      motion.current,
      {
        intensity: 0.62,
        particles: 0.58,
        z: 8.9,
        y: 2.04,
        lookY: 2.47,
        duration: 0.6,
        ease: "power2.inOut",
      },
      0.4,
    );
    mark("action", 1);
    timeline.to(
      motion.current,
      {
        intensity: 0.9,
        particles: 0.92,
        action: 1,
        z: 8.05,
        y: 1.96,
        lookY: 2.46,
        duration: 0.55,
        ease: "power2.inOut",
      },
      1,
    );
    mark("title", 1.55);
    timeline.to(
      motion.current,
      { z: 7.75, y: 1.9, lookY: 2.45, duration: 0.45, ease: "power1.inOut" },
      1.55,
    );
    mark("details", 2.05);
    timeline.to(motion.current, { z: 7.58, y: 1.88, duration: 0.4, ease: "power1.inOut" }, 2.05);
    mark("register", 2.5);
    timeline.to(
      motion.current,
      { z: 7.45, y: 1.86, lookY: 2.45, intensity: 1, particles: 1, action: 1, duration: 0.5, ease: "power2.inOut" },
      2.5,
    );
    timeline.call(
      () => {
        motion.current.drift = reducedRef.current ? 0 : 1;
      },
      [],
      3.05,
    );
    timeline.to({}, { duration: 0.25 }, 3.1);
    safetyRef.current = window.setTimeout(() => finish(), 5200);

    return () => {
      timeline.kill();
      window.clearTimeout(safetyRef.current);
      document.body.classList.remove("intro-lock");
    };
  }, [finish]);

  useEffect(() => {
    if (!reducedMotion || startedReduced.current || finished.current) return;
    finish({ cut: true });
  }, [reducedMotion, finish]);

  return { phase, overlay, motion, skip, instant: cut };
}
