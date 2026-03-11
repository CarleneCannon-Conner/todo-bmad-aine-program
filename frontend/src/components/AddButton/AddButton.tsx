import './AddButton.css';

interface AddButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function AddButton({ onClick, disabled }: AddButtonProps) {
  return (
    <button
      className="add-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Add task"
    >
      +
    </button>
  );
}
