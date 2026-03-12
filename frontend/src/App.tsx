import { useRef, useState } from 'react'
import './App.css'
import { useTodos } from './hooks/useTodos'
import { BeeHeader } from './components/BeeHeader'
import { CardShell } from './components/CardShell'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { AddButton } from './components/AddButton'
import { ErrorMessage } from './components/ErrorMessage'

function App() {
  const { todos, isLoading, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds, itemErrors } = useTodos()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputText, setInputText] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const hasValidInput = inputText.trim().length > 0
  const createError = itemErrors.get('create');

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
      <div className="input-area">
        <TaskInput ref={inputRef} value={inputText} onChange={setInputText} onSubmit={handleSubmit} />
        <AddButton onClick={handleSubmit} disabled={!hasValidInput || isCreating} />
      </div>
      {createError && <ErrorMessage message={createError} />}
      <TaskList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        togglingIds={togglingIds}
        deletingIds={deletingIds}
        itemErrors={itemErrors}
      />
    </CardShell>
  )
}

export default App
