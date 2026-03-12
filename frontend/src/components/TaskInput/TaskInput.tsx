import { forwardRef } from 'react';
import './TaskInput.css';

interface TaskInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
}

export const TaskInput = forwardRef<HTMLInputElement, TaskInputProps>(
  function TaskInput({ value, onChange, onSubmit }, ref) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmit();
      }
    };

    return (
      <input
        ref={ref}
        className="task-input"
        type="text"
        placeholder="add a task..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  }
);
