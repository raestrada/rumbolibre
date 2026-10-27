export default function Logo({ size = 40 }: { size?: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rumbo Libre"
      role="img"
    >
      <defs>
        <linearGradient id="gradC" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ec4899" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#gradC)" />
      <circle cx="32" cy="32" r="21" fill="#ffffff" fillOpacity="0.18" />
      {/* aguja */}
      <path d="M32 18 L37 34 L32 31 L27 34 Z" fill="#ffffff" />
      <path d="M32 46 L37 34 L32 37 L27 34 Z" fill="#fce7f3" />
      <circle cx="32" cy="32" r="3" fill="#ffffff" />
      {/* estrella al norte */}
      <path
        d="M32 9 l1.5 3.2 3.5 .5 -2.5 2.4 .6 3.4 -3.1 -1.7 -3.1 1.7 .6 -3.4 -2.5 -2.4 3.5 -.5 Z"
        fill="#fde68a"
      />
    </svg>
  );
}
