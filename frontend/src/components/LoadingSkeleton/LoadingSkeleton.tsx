import './LoadingSkeleton.css';

export function LoadingSkeleton() {
  return (
    <div className="loading-skeleton" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="skeleton-row"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <svg
            className="skeleton-hex"
            width="28"
            height="28"
            viewBox="0 0 28 28"
          >
            <polygon
              points="14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5"
              fill="#F0E4D0"
              stroke="#E0D0B8"
              strokeWidth="1.5"
            />
          </svg>
          <div className="skeleton-text-bar" />
        </div>
      ))}
    </div>
  );
}
