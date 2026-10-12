import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type SceneJourney = {
  hero: number;
  finale: number;
  pointerX: number;
  pointerY: number;
};

export function useScrollJourney(enabled: boolean) {
  const journey = useRef<SceneJourney>({ hero: 0, finale: 0, pointerX: 0, pointerY: 0 });

  useEffect(() => {
    const state = journey.current;
    state.hero = 0;
    state.finale = 0;
    state.pointerX = 0;
    state.pointerY = 0;

    if (!enabled) return;

    const hero = document.getElementById("top");
    const finale = document.getElementById("register");
    const created: ScrollTrigger[] = [];

    if (hero) {
      created.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.55,
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
          scrub: 0.55,
          onUpdate: (self) => {
            state.finale = self.progress;
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
          end: "top 30%",
          scrub: 0.4,
          onUpdate: (self) => {
            document.documentElement.style.setProperty("--tunnel", self.progress.toFixed(3));
          },
        }),
      );
    }

    const batch = ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: (elements) => {
        elements.forEach((element) => element.classList.add("is-shown"));
      },
    });
    created.push(...batch);

    document.documentElement.classList.add("motion-ready");
    ScrollTrigger.refresh();

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      state.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      state.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (finePointer) window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.classList.remove("motion-ready");
      document.documentElement.style.removeProperty("--journey-hero");
      document.documentElement.style.removeProperty("--tunnel");
      created.forEach((trigger) => trigger.kill());
      state.hero = 0;
      state.finale = 0;
      state.pointerX = 0;
      state.pointerY = 0;
    };
  }, [enabled]);

  return journey;
}
