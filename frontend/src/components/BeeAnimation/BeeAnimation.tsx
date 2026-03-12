import './BeeAnimation.css';

interface BeeAnimationProps {
  onAnimationEnd: () => void;
}

export function BeeAnimation({ onAnimationEnd }: BeeAnimationProps) {
  return (
    <svg
      className="bee-animation"
      viewBox="0 0 20 20"
      aria-hidden="true"
      onAnimationEnd={onAnimationEnd}
    >
      {/* Body */}
      <ellipse cx="10" cy="10" rx="5" ry="4" fill="var(--color-accent)" />
      {/* Stripes */}
      <line x1="8" y1="7" x2="8" y2="13" stroke="var(--color-text)" strokeWidth="0.8" />
      <line x1="11" y1="7" x2="11" y2="13" stroke="var(--color-text)" strokeWidth="0.8" />
      {/* Wings */}
      <ellipse cx="7" cy="6" rx="3" ry="2" fill="var(--color-bee-wing, #FFE8B8)" opacity="0.7" />
      <ellipse cx="13" cy="6" rx="3" ry="2" fill="var(--color-bee-wing, #FFE8B8)" opacity="0.7" />
    </svg>
  );
}
