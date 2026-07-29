/** Simple line icons for the feature grid — black circles hold white strokes. */

type IconProps = { className?: string };

export function IconTruck({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M1 7h13v9H1V7Z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v3h-7v-6Z" strokeLinejoin="round" />
      <circle cx="5.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

export function IconBox({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" strokeLinejoin="round" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBuilding({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16" strokeLinejoin="round" />
      <path d="M16 10h3a1 1 0 0 1 1 1v10" strokeLinejoin="round" />
      <path d="M8 8h2M8 12h2M8 16h2M13 21v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export function IconTag({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconChat({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-0-0V6Z" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function IconMap({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M9 4 3 6.5v13L9 17l6 2.5L21 17V4l-6 2.5L9 4Z" strokeLinejoin="round" />
      <path d="M9 4v13M15 6.5v13" />
    </svg>
  );
}

export function IconArrow({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFacebook({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function IconX({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.4 21H2.3l7.3-8.3L2 3h6.3l4.4 5.8L17.5 3Zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5Z" />
    </svg>
  );
}

export function IconInstagram({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const iconMap = {
  truck: IconTruck,
  box: IconBox,
  building: IconBuilding,
  tag: IconTag,
  chat: IconChat,
  map: IconMap,
} as const;

export type FeatureIconName = keyof typeof iconMap;

export function FeatureIcon({ name }: { name: FeatureIconName }) {
  const Comp = iconMap[name];
  return <Comp />;
}
