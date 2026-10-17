import { contact, logos, socialLinks } from "../config/site.ts";
import { BrandLogo } from "./Navbar.tsx";
import { QuietControls } from "./QuietControls.tsx";

const partners = [
  { src: logos.kl, name: "KL University" },
  { src: logos.gdg, name: "Google Developer Groups" },
  { src: logos.whh, name: "White Hat Hackers" },
];

export function EventFooter() {
  return (
    <footer id="partners" className="partners-sheet scroll-mt-8">
      <div className="partners-copy">
        <p className="type-meta text-cyan">PARTNERS</p>
        <h2 className="type-section mt-3">THE ORGANISERS</h2>
        <p className="type-body mt-4 max-w-xl">
          DEAD NOCTIS CTF Season 01 is hosted with KL University, Google Developer Groups, and White Hat Hackers.
        </p>
        <ul className="partner-row">
          {partners.map((partner) => (
            <li key={partner.name}>
              <BrandLogo src={partner.src} alt={partner.name} />
              <span>{partner.name}</span>
            </li>
          ))}
        </ul>
        <div className="footer-grid">
          <div>
            <h3 className="type-meta text-muted">QUESTIONS</h3>
            <p className="type-small mt-2">
              {contact.email ? (
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              ) : (
                "Email to be announced"
              )}
            </p>
            <p className="type-small mt-1 text-muted">{contact.phone ?? "Phone to be announced"}</p>
          </div>
          <div>
            <h3 className="type-meta text-muted">FOLLOW THE RUN</h3>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} className="type-meta text-ink" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <span className="type-meta text-muted">
                      {link.label}
                      <span className="ml-2">Link pending</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="type-meta text-muted">FINALS</h3>
            <p className="type-small mt-2">26–27 December 2026</p>
            <p className="type-small text-muted">KLEF, Vaddeswaram</p>
          </div>
        </div>
        <QuietControls />
        <div className="footer-identity">
          <p>DEAD NOCTIS CTF · SEASON 01</p>
          <p className="mt-1">KL University × Google Developer Groups × White Hat Hackers</p>
        </div>
      </div>
    </footer>
  );
}
