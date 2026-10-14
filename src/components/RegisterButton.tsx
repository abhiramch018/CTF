import { registrationUrl } from "../config/site.ts";

type RegisterButtonProps = {
  children: string;
  variant?: "primary" | "nav" | "footer";
  className?: string;
};

const variantClass = {
  primary: "btn-primary register-command text-center",
  nav: "btn-primary btn-nav register-command text-center",
  footer: "btn-primary register-command text-center",
};

export function RegisterButton({ children, variant = "primary", className = "" }: RegisterButtonProps) {
  const classes = `${variantClass[variant]} ${className}`.trim();
  const cursor = variant === "nav" ? "join" : "enter";

  if (registrationUrl) {
    return (
      <a
        className={classes}
        href={registrationUrl}
        rel="noopener noreferrer"
        data-cursor={cursor}
        data-magnetic=""
        data-registration="open"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled
      aria-disabled="true"
      data-cursor={cursor}
      data-magnetic=""
      data-registration="pending"
    >
      <span>{children}</span>
      {variant === "nav" ? (
        <span className="sr-only">Registration link has not been published yet.</span>
      ) : (
        <span className="register-status">Registration opens soon</span>
      )}
    </button>
  );
}
