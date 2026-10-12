import { useEffect, useState } from "react";
import { logos } from "../config/site.ts";
import { navLinks } from "../content/event.ts";
import { RegisterButton } from "./RegisterButton.tsx";

type NavbarProps = {
  settled: boolean;
};

function BrandLogo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="max-w-24 font-mono text-[10px] leading-tight tracking-wide text-ink">{alt}</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      width={56}
      height={56}
      className="h-12 w-auto bg-white object-contain md:h-14"
      onError={() => setFailed(true)}
    />
  );
}

export function Navbar({ settled }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-nav ${settled ? "is-ready" : "is-waiting"} ${scrolled || open ? "is-solid" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
        <a href="#top" className="flex items-center gap-2" aria-label="DEAD NOCTIS CTF home">
          <BrandLogo src={logos.gdg} alt="Google Developer Groups, KL Deemed to be University" />
          <BrandLogo src={logos.whh} alt="White Hat Hackers" />
          <span className="ml-1 hidden leading-tight sm:block">
            <span className="block font-display text-[11px] text-ink md:text-xs">DEAD NOCTIS</span>
            <span className="block font-mono text-[10px] tracking-[0.18em] text-muted">CTF · S01</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Sections">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
          <RegisterButton variant="nav">REGISTER</RegisterButton>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <RegisterButton variant="nav">REGISTER</RegisterButton>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-obsidian text-ink"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span className="block h-px w-4 bg-ink" />
              <span className="block h-px w-4 bg-ink" />
              <span className="block h-px w-4 bg-neon" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-obsidian px-4 py-3 md:hidden" aria-label="Sections">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="nav-link block py-3 text-ink"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
