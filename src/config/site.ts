/**
 * Destinations the organisers have not published yet stay null.
 * Null values are shown as pending and are never turned into links.
 */
export const registrationUrl: string | null = null;

export const contact = {
  email: null as string | null,
  phone: null as string | null,
};

export const socialLinks: { label: string; href: string | null }[] = [
  { label: "Instagram", href: null },
  { label: "LinkedIn", href: null },
  { label: "Discord", href: null },
  { label: "YouTube", href: null },
  { label: "Telegram", href: null },
];

export const logos = {
  kl: "/brands/kl.png",
  gdg: "/brands/gdev.png",
  whh: "/brands/whh.png",
};
