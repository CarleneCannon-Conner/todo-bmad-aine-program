import { useState } from 'react'
import './App.css'
import { useTodos } from './hooks/useTodos'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { AddButton } from './components/AddButton'

function App() {
  const { todos, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds } = useTodos()
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
    <div className="app">
      <h1>Todo App</h1>
      <div className="input-area">
        <TaskInput value={inputText} onChange={setInputText} onSubmit={handleSubmit} />
        <AddButton onClick={handleSubmit} disabled={!hasValidInput || isCreating} />
      </div>
      <TaskList
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        togglingIds={togglingIds}
        deletingIds={deletingIds}
      />
    </div>
  )
}

export default App
