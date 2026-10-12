import { contact, socialLinks } from "../config/site.ts";
import { inr } from "../content/event.ts";
import { GhostWord } from "./GhostWord.tsx";
import { PortalFallback } from "./PortalFallback.tsx";
import { RegisterButton } from "./RegisterButton.tsx";

type EventFooterProps = {
  reducedMotion: boolean;
};

export function EventFooter({ reducedMotion }: EventFooterProps) {
  return (
    <footer id="register" className="chapter finale-sheet scroll-mt-24 border-t border-obsidian px-5 py-20 md:px-8">
      <div className="chapter-stage">
      <div className="finale-scrim" aria-hidden="true" />
      <GhostWord>ENTER</GhostWord>
      <div className="section-copy relative z-[1] mx-auto max-w-6xl">
        <PortalFallback animate={!reducedMotion} compact />
        <p className="type-meta mt-8 text-neon">05 / FINAL ACCESS</p>
        <h2 className="type-finale mt-3">THE SYSTEM IS WAITING.</h2>
        <p className="type-kicker mt-4">ARE YOU READY TO ENTER?</p>
        <div className="mt-8">
          <RegisterButton variant="footer">REGISTER</RegisterButton>
        </div>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-obsidian bg-void/70 p-4">
            <dt className="type-meta text-muted">QUALIFIER</dt>
            <dd className="type-small mt-2 text-ink">6 December 2026 · online · 9 AM – 9 PM</dd>
          </div>
          <div className="border border-obsidian bg-void/70 p-4">
            <dt className="type-meta text-muted">FINALS</dt>
            <dd className="type-small mt-2 text-ink">26–27 December 2026 · KLEF, Vaddeswaram</dd>
          </div>
          <div className="border border-obsidian bg-void/70 p-4">
            <dt className="type-meta text-muted">FEE</dt>
            <dd className="type-small mt-2 text-ink">{inr.fee} per player</dd>
          </div>
          <div className="border border-obsidian bg-void/70 p-4">
            <dt className="type-meta text-muted">QUESTIONS</dt>
            <dd className="type-small mt-2 text-ink">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="hover:text-neon">
                  {contact.email}
                </a>
              ) : (
                <span>Email to be announced</span>
              )}
              <span className="mt-1 block text-muted">
                {contact.phone ? contact.phone : "Phone to be announced"}
              </span>
            </dd>
          </div>
        </dl>
        <div className="mt-8">
          <h3 className="type-meta text-muted">FOLLOW THE RUN</h3>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a href={link.href} className="type-meta text-ink hover:text-neon" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <span className="type-meta text-muted">
                    {link.label}
                    <span className="ml-2 text-amber">Link pending</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="type-meta mt-12 border-t border-obsidian pt-6 text-muted">
          <p>GDG × WHITE HAT HACKERS</p>
          <p className="mt-2">DEAD NOCTIS CTF · SEASON 01</p>
        </div>
      </div>
      </div>
    </footer>
  );
}
