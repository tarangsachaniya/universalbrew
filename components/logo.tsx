type LogoProps = {
  variant?: "mark" | "full"
  className?: string
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return (
      <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Universal Brew">
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2" />
        <g transform="translate(32,17) rotate(-20)">
          <ellipse cx="0" cy="0" rx="5.5" ry="3.2" fill="currentColor" />
          <path d="M -3.2 0 Q 0 -1.6 3.2 0" stroke="var(--color-cream)" strokeWidth="0.7" fill="none" />
        </g>
        <text x="32" y="42" textAnchor="middle" fontFamily="var(--font-playfair), Georgia, serif" fontWeight="600" fontSize="24" fill="currentColor">UB</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 60" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Universal Brew — The Coffee Masters">
      <g>
        <circle cx="28" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="2" />
        <g transform="translate(28,17) rotate(-20)">
          <ellipse cx="0" cy="0" rx="4.8" ry="2.8" fill="currentColor" />
          <path d="M -2.8 0 Q 0 -1.4 2.8 0" stroke="var(--color-cream)" strokeWidth="0.6" fill="none" />
        </g>
        <text x="28" y="38" textAnchor="middle" fontFamily="var(--font-playfair), Georgia, serif" fontWeight="600" fontSize="21" fill="currentColor">UB</text>
      </g>
      <text x="66" y="30" fontFamily="var(--font-playfair), Georgia, serif" fontWeight="700" fontSize="19" letterSpacing="0.5" fill="currentColor">UNIVERSALBREW</text>
      <text x="66" y="46" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight="500" fontSize="9" letterSpacing="2" fill="currentColor" opacity="0.75">· THE COFFEE MASTERS ·</text>
    </svg>
  )
}
