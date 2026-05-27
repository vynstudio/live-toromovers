import Link from "next/link";

type Props = {
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
};

// Every quote/price CTA routes to the dedicated /quote wizard.
export function RequestButton({
  label,
  variant = "primary",
  fullWidth = false,
  className = "",
}: Props) {
  const variantClass = `btn-${variant}`;
  return (
    <Link
      href="/quote"
      className={`btn ${variantClass} ${className}`.trim()}
      style={fullWidth ? { width: "100%" } : undefined}
    >
      {label ?? "Get free quote"}
      <span className="arrow" aria-hidden />
    </Link>
  );
}
