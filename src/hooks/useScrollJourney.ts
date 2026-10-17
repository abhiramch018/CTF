import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type SceneJourney = {
  hero: number;
  finale: number;
  tunnel: number;
  breach: number;
  depth: number;
  pointerX: number;
  pointerY: number;
};

export function useScrollJourney(enabled: boolean) {
  const journey = useRef<SceneJourney>({
    hero: 0,
    finale: 0,
    tunnel: 0,
    breach: 0,
    depth: 0,
    pointerX: 0,
    pointerY: 0,
  });

  useEffect(() => {
    const state = journey.current;
    state.hero = 0;
    state.finale = 0;
    state.tunnel = 0;
    state.breach = 0;
    state.depth = 0;
    state.pointerX = 0;
    state.pointerY = 0;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      state.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      state.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--px", state.pointerX.toFixed(3));
      document.documentElement.style.setProperty("--py", state.pointerY.toFixed(3));
    };
    if (finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (!enabled) {
      return () => {
        if (finePointer) window.removeEventListener("pointermove", onPointerMove);
      };
    }

    const hero = document.getElementById("top");
    const finale = document.getElementById("register");
    const created: ScrollTrigger[] = [];

    if (hero) {
      created.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
          onUpdate: (self) => {
            state.hero = self.progress;
            document.documentElement.style.setProperty("--journey-hero", self.progress.toFixed(3));
          },
        }),
      );
    }

    if (finale) {
      created.push(
        ScrollTrigger.create({
          trigger: finale,
          start: "top 85%",
          end: "top 28%",
          scrub: 0.65,
          onUpdate: (self) => {
            state.finale = self.progress;
          },
        }),
      );
    }

    const breach = document.getElementById("breach");
    if (breach) {
      created.push(
        ScrollTrigger.create({
          trigger: breach,
          start: "top 78%",
          end: "bottom 42%",
          scrub: 0.7,
          onUpdate: (self) => {
            state.breach = self.progress;
            document.documentElement.style.setProperty("--breach", self.progress.toFixed(3));
          },
        }),
      );
    }

    const tunnel = document.getElementById("challenges");
    if (tunnel) {
      created.push(
        ScrollTrigger.create({
          trigger: tunnel,
          start: "top bottom",
          end: "top 35%",
          scrub: 0.5,
          onUpdate: (self) => {
            state.tunnel = self.progress;
            document.documentElement.style.setProperty("--tunnel", self.progress.toFixed(3));
          },
        }),
      );
    }

    const batch = ScrollTrigger.batch(".reveal", {
      start: "top 90%",
      once: true,
      onEnter: (elements) => {
        elements.forEach((element) => element.classList.add("is-shown"));
      },
    });
    created.push(...batch);

    document.documentElement.classList.add("motion-ready");
    ScrollTrigger.refresh();

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const depth = window.scrollY / max;
      state.depth = depth;
      document.documentElement.style.setProperty("--scroll-depth", depth.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (finePointer) window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.style.removeProperty("--px");
      document.documentElement.style.removeProperty("--py");
      document.documentElement.classList.remove("motion-ready");
      document.documentElement.style.removeProperty("--journey-hero");
      document.documentElement.style.removeProperty("--tunnel");
      document.documentElement.style.removeProperty("--scroll-depth");
      document.documentElement.style.removeProperty("--breach");
      created.forEach((trigger) => trigger.kill());
      state.hero = 0;
      state.finale = 0;
      state.tunnel = 0;
      state.breach = 0;
      state.depth = 0;
      state.pointerX = 0;
      state.pointerY = 0;
    };
  }, [enabled]);

  return journey;
}
