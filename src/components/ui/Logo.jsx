import { LOGO_D, LOGO_VIEWBOX } from "@/lib/logo";

export default function Logo({ className, title = "Zerror Studios" }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      role="img"
      aria-label={title}
      fill="currentColor"
    >
      <path d={LOGO_D} />
    </svg>
  );
}
