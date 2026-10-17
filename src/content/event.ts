export const challenges = [
  {
    id: "01",
    name: "Web Security",
    summary: "Web application security inside organiser-controlled environments.",
    pixels: ["11111", "10001", "11111", "10101", "11111"],
  },
  {
    id: "02",
    name: "Cryptography",
    summary: "Ciphers, encodings, and cryptographic problem-solving.",
    pixels: ["00110", "00101", "01110", "00100", "01100"],
  },
  {
    id: "03",
    name: "Pwn",
    summary: "Binary exploitation inside isolated challenge environments.",
    pixels: ["11111", "10001", "10101", "11011", "11111"],
  },
  {
    id: "04",
    name: "Reverse Engineering",
    summary: "Take apart challenge binaries and understand program behaviour.",
    pixels: ["10101", "10001", "11111", "10001", "10101"],
  },
  {
    id: "05",
    name: "Digital Forensics",
    summary: "Files, artifacts, metadata, and incident evidence.",
    pixels: ["01110", "01010", "01110", "00100", "01110"],
  },
  {
    id: "06",
    name: "OSINT",
    summary: "Investigation that uses public information only.",
    pixels: ["10101", "01010", "10101", "01010", "10101"],
  },
  {
    id: "07",
    name: "Physical OSINT",
    summary: "Hands-on, real-world OSINT tasks in the field.",
    pixels: ["00100", "01110", "00100", "00100", "01110"],
  },
  {
    id: "08",
    name: "Miscellaneous",
    summary: "Logic, scripting, and cross-disciplinary puzzles.",
    pixels: ["11111", "10001", "10101", "10001", "11111"],
  },
  {
    id: "09",
    name: "LLM / AI",
    summary: "AI security and reasoning, kept inside a controlled scope.",
    pixels: ["01110", "11011", "11111", "11011", "01110"],
  },
  {
    id: "10",
    name: "Steganography",
    summary: "Hidden data and media analysis.",
    pixels: ["11111", "00000", "11111", "00000", "11111"],
  },
] as const;

export const navLinks = [
  { href: "#countdown", label: "Countdown" },
  { href: "#overview", label: "Mission" },
  { href: "#challenges", label: "Sectors" },
  { href: "#competition", label: "Protocol" },
  { href: "#register", label: "Arena" },
] as const;

export const inr = {
  total: "₹1,00,000",
  first: "₹50,000",
  second: "₹30,000",
  third: "₹20,000",
  fee: "₹200",
} as const;
