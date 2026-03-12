import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  completedCount: number;
  totalCount: number;
}

export function ProgressIndicator({ completedCount, totalCount }: ProgressIndicatorProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="progress-indicator" role="status" aria-label={`${completedCount} of ${totalCount} tasks complete`}>
      <svg
        className="progress-hex-icon"
        width="18"
        height="18"
        viewBox="0 0 28 28"
        aria-hidden="true"
      >
        <polygon
          points="14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5"
          fill="var(--color-accent)"
        />
      </svg>
      <span className="progress-text">
        {completedCount}/{totalCount} complete
      </span>
    </div>
  );
}
