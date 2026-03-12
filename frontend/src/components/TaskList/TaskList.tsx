import type { Todo } from '@todo/shared';
import { TaskItem } from '../TaskItem';
import { LoadingSkeleton } from '../LoadingSkeleton';
import './TaskList.css';

interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
  enteringIds?: Set<string>;
  onEnteringAnimationEnd?: (id: string) => void;
  isLoading: boolean;
  itemErrors: Map<string, string>;
}

export function TaskList({ todos, onToggle, onDelete, togglingIds, deletingIds, enteringIds, onEnteringAnimationEnd, isLoading, itemErrors }: TaskListProps) {
  if (isLoading && todos.length === 0) {
    return <LoadingSkeleton />;
  }

  if (todos.length === 0) {
    return null;
  }

  return (
    <ul className="task-list" aria-label="Todo list" aria-live="polite">
      {todos.map((todo) => (
        <li key={todo.id} className="task-list-item">
          <TaskItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            isToggling={togglingIds.has(todo.id)}
            isDeleting={deletingIds.has(todo.id)}
            isEntering={enteringIds?.has(todo.id)}
            onAnimationEnd={() => onEnteringAnimationEnd?.(todo.id)}
            error={itemErrors.get(todo.id)}
          />
        </li>
      ))}
    </ul>
  );
}
