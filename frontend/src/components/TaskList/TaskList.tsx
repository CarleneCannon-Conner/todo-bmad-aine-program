import type { Todo } from '@todo/shared';
import { TaskItem } from '../TaskItem';
import './TaskList.css';

interface TaskListProps {
  todos: Todo[];
}

export function TaskList({ todos }: TaskListProps) {
  return (
    <ul className="task-list">
      {todos.map((todo) => (
        <li key={todo.id} className="task-list-item">
          <TaskItem todo={todo} />
        </li>
      ))}
    </ul>
  );
}
