import './DeleteButton.css';

interface DeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
}

export function DeleteButton({ onDelete, disabled }: DeleteButtonProps) {
  return (
    <button
      type="button"
      className="delete-button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      disabled={disabled}
      aria-label="Delete task"
    >
      ×
    </button>
  );
}
