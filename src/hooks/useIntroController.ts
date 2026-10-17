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
  lookX: number;
  lookY: number;
  lookZ: number;
  intensity: number;
  particles: number;
  drift: number;
  action: number;
  city: number;
  cube: number;
  beam: number;
  figure: number;
};

export type MotionRef = RefObject<SceneMotion>;

export function heroMotion(reducedMotion: boolean): SceneMotion {
  return {
    x: -2.55,
    y: 3.2,
    z: 12.5,
    lookX: 0.85,
    lookY: 1.65,
    lookZ: 0.2,
    intensity: 1,
    particles: reducedMotion ? 0 : 1,
    drift: reducedMotion ? 0 : 1,
    action: 1,
    city: 1,
    cube: 1,
    beam: 1,
    figure: 1,
  };
}

function distantMotion(): SceneMotion {
  return {
    x: -3.4,
    y: 3.4,
    z: 14.2,
    lookX: 0.4,
    lookY: 2.1,
    lookZ: -5,
    intensity: 0.08,
    particles: 0.12,
    drift: 0,
    action: 0,
    city: 0.04,
    cube: 0,
    beam: 0,
    figure: 0,
  };
}

function applyMotion(target: SceneMotion, next: SceneMotion) {
  target.x = next.x;
  target.y = next.y;
  target.z = next.z;
  target.lookX = next.lookX;
  target.lookY = next.lookY;
  target.lookZ = next.lookZ;
  target.intensity = next.intensity;
  target.particles = next.particles;
  target.drift = next.drift;
  target.action = next.action;
  target.city = next.city;
  target.cube = next.cube;
  target.beam = next.beam;
  target.figure = next.figure;
}

function simplifyIntro(reducedMotion: boolean) {
  if (reducedMotion || typeof window === "undefined") return reducedMotion;
  const narrow = window.matchMedia("(max-width: 760px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return narrow || (cores <= 4 && memory <= 4);
}

function deepLink() {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.length > 1 && hash !== "#top";
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
  const bypass = seen || simplifyIntro(reducedMotion) || deepLink();
  const motion = useRef<SceneMotion>(bypass ? heroMotion(reducedMotion) : distantMotion());
  const [phase, setPhase] = useState<IntroPhase>(bypass ? "done" : "void");
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
    if (finished.current || introAlreadySeen() || deepLink()) return;

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
      {
        city: 1,
        intensity: 0.36,
        particles: 0.34,
        z: 12.4,
        y: 3.05,
        lookZ: -0.4,
        lookX: 0.35,
        duration: 0.65,
        ease: "power1.out",
      },
      0,
    );
    mark("portal", 0.65);
    timeline.to(
      motion.current,
      { cube: 1, intensity: 0.62, particles: 0.55, duration: 0.42, ease: "power2.out" },
      0.65,
    );
    mark("action", 1.08);
    timeline.to(
      motion.current,
      { beam: 1, action: 0.7, intensity: 0.84, duration: 0.4, ease: "power2.inOut" },
      1.08,
    );
    timeline.to(
      motion.current,
      {
        figure: 1,
        action: 1,
        intensity: 1,
        particles: 1,
        x: -2.55,
        y: 3.2,
        z: 12.5,
        lookX: 0.85,
        lookY: 1.65,
        lookZ: 0.2,
        duration: 0.48,
        ease: "power2.inOut",
      },
      1.48,
    );
    mark("title", 1.95);
    mark("details", 2.4);
    mark("register", 2.85);
    timeline.call(
      () => {
        motion.current.drift = reducedRef.current ? 0 : 1;
      },
      [],
      3.15,
    );
    timeline.to({}, { duration: 0.2 }, 3.15);
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

  return { phase, overlay: false, motion, skip, instant: cut };
}
