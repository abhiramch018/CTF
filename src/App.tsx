import { CyberCursor } from "./components/CyberCursor.tsx";
import { LandingPage } from "./components/LandingPage.tsx";
import { useIntroController } from "./hooks/useIntroController.ts";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.ts";

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const intro = useIntroController(reducedMotion);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <LandingPage
        motion={intro.motion}
        phase={intro.phase}
        reducedMotion={reducedMotion}
        instant={intro.instant}
        onSkip={intro.skip}
      />
      <CyberCursor reducedMotion={reducedMotion} />
    </>
  );
}
