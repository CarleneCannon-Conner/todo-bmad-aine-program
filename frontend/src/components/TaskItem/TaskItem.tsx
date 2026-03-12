import type { Todo } from '@todo/shared';
import { HexCheckbox } from '../HexCheckbox';
import { DeleteButton } from '../DeleteButton';
import { ErrorMessage } from '../ErrorMessage';
import './TaskItem.css';

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
  error?: string;
}

export function TaskItem({ todo, onToggle, onDelete, isToggling, isDeleting, error }: TaskItemProps) {
  const className = [
    'task-item',
    todo.isCompleted ? 'task-item--completed' : '',
    isToggling ? 'task-item--toggling' : '',
    isDeleting ? 'task-item--deleting' : '',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!isToggling && !isDeleting) {
      onToggle(todo.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (!isDeleting && !isToggling) {
        onDelete(todo.id);
      }
    }
  };

  return (
    <div className={className}>
      <div className="task-item-row">
        <div
          className="task-item-toggle"
          role="checkbox"
          aria-checked={todo.isCompleted}
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <HexCheckbox checked={todo.isCompleted} />
          <span className="task-item-text">{todo.text}</span>
        </div>
        <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
