import { useState } from 'react'
import './App.css'
import { useTodos } from './hooks/useTodos'
import { BeeHeader } from './components/BeeHeader'
import { CardShell } from './components/CardShell'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { AddButton } from './components/AddButton'

function App() {
  const { todos, isLoading, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds } = useTodos()
  const [inputText, setInputText] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const hasValidInput = inputText.trim().length > 0

  const handleSubmit = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      await createTodo(trimmed)
      setInputText('')
    } catch {
      // Keep text for retry — Story 4.2 will add error display
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <CardShell>
      <BeeHeader />
      <div className="input-area">
        <TaskInput value={inputText} onChange={setInputText} onSubmit={handleSubmit} />
        <AddButton onClick={handleSubmit} disabled={!hasValidInput || isCreating} />
      </div>
      <TaskList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        togglingIds={togglingIds}
        deletingIds={deletingIds}
      />
    </CardShell>
  )
}

export default App
