import { useState } from 'react';
import './TaskInput.css';

interface TaskInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function TaskInput({ onSubmit }: TaskInputProps) {
  const [text, setText] = useState('');

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim()) {
      try {
        await onSubmit(text.trim());
        setText('');
      } catch {
        // Error display handled by Story 4.2
      }
    }
  };

  return (
    <input
      className="task-input"
      type="text"
      placeholder="add a task..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}
