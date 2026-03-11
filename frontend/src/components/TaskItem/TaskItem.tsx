import type { Todo } from '@todo/shared';
import './TaskItem.css';

interface TaskItemProps {
  todo: Todo;
}

export function TaskItem({ todo }: TaskItemProps) {
  return (
    <span className="task-item-text">{todo.text}</span>
  );
}
