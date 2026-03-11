import type { Todo } from '@todo/shared';
import { DeleteButton } from '../DeleteButton';
import './TaskItem.css';

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export function TaskItem({ todo, onToggle, onDelete, isToggling, isDeleting }: TaskItemProps) {
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
    <div className={className} onClick={handleClick}>
      <span className="task-item-text">{todo.text}</span>
      <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
    </div>
  );
}
