import './AllClearCelebration.css';

export function AllClearCelebration() {
  return (
    <div className="all-clear" role="alert" aria-label="All tasks complete!">
      <svg
        className="all-clear-bee"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {/* Body */}
        <ellipse cx="10" cy="10" rx="5" ry="4" fill="var(--color-bee-body)" />
        {/* Stripes */}
        <line x1="8" y1="7" x2="8" y2="13" stroke="var(--color-text)" strokeWidth="0.8" />
        <line x1="11" y1="7" x2="11" y2="13" stroke="var(--color-text)" strokeWidth="0.8" />
        {/* Wings */}
        <ellipse cx="7" cy="6" rx="3" ry="2" fill="var(--color-bee-wing)" opacity="0.7" />
        <ellipse cx="13" cy="6" rx="3" ry="2" fill="var(--color-bee-wing)" opacity="0.7" />
      </svg>
      <p className="all-clear-text">all clear!</p>
    </div>
  );
}
