import { registrationUrl } from "../config/site.ts";

type RegisterButtonProps = {
  children: string;
  variant?: "primary" | "nav" | "footer";
  className?: string;
};

const variantClass = {
  primary: "btn-primary text-center text-void",
  nav: "btn-primary btn-nav text-void",
  footer: "btn-primary text-center text-void",
};

export function RegisterButton({ children, variant = "primary", className = "" }: RegisterButtonProps) {
  const classes = `${variantClass[variant]} ${className}`.trim();
  const cursor = variant === "nav" ? "join" : "enter";

  if (registrationUrl) {
    return (
      <a className={classes} href={registrationUrl} rel="noopener noreferrer" data-cursor={cursor} data-magnetic="">
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} aria-disabled="true" data-cursor={cursor} data-magnetic="">
      <span>{children}</span>
      {variant === "nav" ? (
        <span className="sr-only">Registration link has not been published yet.</span>
      ) : (
        <span className="mt-1 block font-mono text-[10px] tracking-normal text-void/70">Link pending</span>
      )}
    </button>
  );
}
