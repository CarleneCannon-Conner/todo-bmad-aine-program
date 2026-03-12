import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useTodos } from './hooks/useTodos'
import { BeeHeader } from './components/BeeHeader'
import { CardShell } from './components/CardShell'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { AddButton } from './components/AddButton'
import { ErrorMessage } from './components/ErrorMessage'
import { ProgressIndicator } from './components/ProgressIndicator'
import { AllClearCelebration } from './components/AllClearCelebration'

function App() {
  const { todos, isLoading, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds, itemErrors } = useTodos()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputText, setInputText] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set())
  const prevTodoIdsRef = useRef<Set<string>>(new Set())

  const hasValidInput = inputText.trim().length > 0
  const createError = itemErrors.get('create');
  const completedCount = todos.filter(t => t.isCompleted).length;
  const totalCount = todos.length;
  const allComplete = totalCount > 0 && completedCount === totalCount;
  const prevAllComplete = useRef(allComplete);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (allComplete && !prevAllComplete.current) {
      setShowCelebration(true);
    }
    if (!allComplete) {
      setShowCelebration(false);
    }
    prevAllComplete.current = allComplete;
  }, [allComplete]);

  useEffect(() => {
    const currentIds = new Set(todos.map(t => t.id));
    const newIds = new Set<string>();
    for (const id of currentIds) {
      if (!prevTodoIdsRef.current.has(id)) {
        newIds.add(id);
      }
    }
    if (newIds.size > 0 && prevTodoIdsRef.current.size > 0) {
      setEnteringIds(prev => new Set([...prev, ...newIds]));
    }
    prevTodoIdsRef.current = currentIds;
  }, [todos]);

  const handleEnteringAnimationEnd = (id: string) => {
    setEnteringIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      await createTodo(trimmed)
      setInputText('')
    } catch {
      // Input keeps text for retry — error is set in useTodos
      inputRef.current?.focus();
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <CardShell>
      <BeeHeader />
      <ProgressIndicator completedCount={completedCount} totalCount={totalCount} />
      <div className="input-area">
        <TaskInput ref={inputRef} value={inputText} onChange={setInputText} onSubmit={handleSubmit} />
        <AddButton onClick={handleSubmit} disabled={!hasValidInput || isCreating} />
      </div>
      {createError && <ErrorMessage message={createError} />}
      {showCelebration && <AllClearCelebration />}
      <TaskList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        togglingIds={togglingIds}
        deletingIds={deletingIds}
        enteringIds={enteringIds}
        onEnteringAnimationEnd={handleEnteringAnimationEnd}
        itemErrors={itemErrors}
      />
    </CardShell>
  )
}

export default App
