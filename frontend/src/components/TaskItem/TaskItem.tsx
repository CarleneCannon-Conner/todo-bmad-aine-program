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

  return (
    <div className={className}>
      <div className="task-item-row" onClick={handleClick}>
        <HexCheckbox checked={todo.isCompleted} />
        <span className="task-item-text">{todo.text}</span>
        <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
