import './TaskInput.css';

interface TaskInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
}

export function TaskInput({ value, onChange, onSubmit }: TaskInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <input
      className="task-input"
      type="text"
      placeholder="add a task..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}
