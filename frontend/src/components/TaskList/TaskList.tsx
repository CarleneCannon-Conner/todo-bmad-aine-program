import type { Todo } from '@todo/shared';
import { TaskItem } from '../TaskItem';
import './TaskList.css';

interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
}

export function TaskList({ todos, onToggle, onDelete, togglingIds, deletingIds }: TaskListProps) {
  return (
    <ul className="task-list">
      {todos.map((todo) => (
        <li key={todo.id} className="task-list-item">
          <TaskItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            isToggling={togglingIds.has(todo.id)}
            isDeleting={deletingIds.has(todo.id)}
          />
        </li>
      ))}
    </ul>
  );
}
