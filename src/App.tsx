import { IntroSequence } from "./components/IntroSequence.tsx";
import { LandingPage } from "./components/LandingPage.tsx";
import { useIntroController } from "./hooks/useIntroController.ts";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.ts";

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const intro = useIntroController(reducedMotion);

  return (
    <>
      {intro.overlay ? null : (
        <a className="skip-link" href="#main">
          Skip to content
        </a>
      )}
      {intro.overlay ? (
        <IntroSequence phase={intro.phase} reducedMotion={reducedMotion} onSkip={intro.skip} />
      ) : null}
      <LandingPage
        motion={intro.motion}
        phase={intro.phase}
        locked={intro.overlay}
        reducedMotion={reducedMotion}
      />
    </>
  );
}
