import { useEffect, useState, type MouseEvent } from "react";
import { logos } from "../config/site.ts";
import { navLinks } from "../content/event.ts";

type NavbarProps = {
  settled: boolean;
  reducedMotion: boolean;
};

const field = [
  { href: "#top", id: "top", label: "Gate" },
  ...navLinks.map((link) => ({ href: link.href, id: link.href.slice(1), label: link.label })),
  { href: "#partners", id: "partners", label: "Partners" },
];

export function BrandLogo({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="max-w-24 font-mono text-[10px] leading-tight tracking-wide text-ink">{alt}</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      width={160}
      height={88}
      className="brand-logo object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export function Navbar({ settled, reducedMotion }: NavbarProps) {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const nodes = field
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    event.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    if (!node.hasAttribute("tabindex")) node.tabIndex = -1;
    window.setTimeout(() => {
      node.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      node.focus({ preventScroll: true });
    }, 0);
  };

  return (
    <header className={`site-nav ${settled ? "is-ready" : "is-waiting"}`}>
      <a href="#top" className="brand-lockup" aria-label="DEAD NOCTIS CTF home" data-cursor="link" onMouseDown={(event) => event.preventDefault()} onClick={(event) => go(event, "top")}>
        <BrandLogo src={logos.kl} alt="KL University" />
        <BrandLogo src={logos.gdg} alt="Google Developer Groups" />
        <BrandLogo src={logos.whh} alt="White Hat Hackers" />
      </a>
      <nav className="field-index" aria-label="Sections">
        <ol>
          {field.map((item, index) => (
            <li key={item.id}>
              <a
                href={item.href}
                data-cursor="open"
                aria-current={active === item.id ? "location" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => go(event, item.id)}
              >
                <span>{String(index).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
}
