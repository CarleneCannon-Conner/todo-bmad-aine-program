import { useEffect, useRef, useState } from 'react';
import type { Todo } from '@todo/shared';
import { HexCheckbox } from '../HexCheckbox';
import { DeleteButton } from '../DeleteButton';
import { ErrorMessage } from '../ErrorMessage';
import { BeeAnimation } from '../BeeAnimation';
import './TaskItem.css';

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
  isEntering?: boolean;
  onAnimationEnd?: () => void;
  error?: string;
}

export function TaskItem({ todo, onToggle, onDelete, isToggling, isDeleting, isEntering, onAnimationEnd, error }: TaskItemProps) {
  const prevCompleted = useRef(todo.isCompleted);
  const [showBeeAnimation, setShowBeeAnimation] = useState(false);

  useEffect(() => {
    if (todo.isCompleted && !prevCompleted.current) {
      setShowBeeAnimation(true);
    }
    prevCompleted.current = todo.isCompleted;
  }, [todo.isCompleted]);

  const handleBeeAnimationEnd = () => setShowBeeAnimation(false);

  const className = [
    'task-item',
    todo.isCompleted ? 'task-item--completed' : '',
    isToggling ? 'task-item--toggling' : '',
    isDeleting ? 'task-item--deleting' : '',
    isEntering ? 'task-item--entering' : '',
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
    <div className={className} onAnimationEnd={onAnimationEnd}>
      <div className="task-item-row">
        <div
          className="task-item-toggle"
          role="checkbox"
          aria-checked={todo.isCompleted}
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          style={{ position: 'relative' }}
        >
          <HexCheckbox checked={todo.isCompleted} />
          {showBeeAnimation && <BeeAnimation onAnimationEnd={handleBeeAnimationEnd} />}
          <span className="task-item-text">{todo.text}</span>
        </div>
        <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
