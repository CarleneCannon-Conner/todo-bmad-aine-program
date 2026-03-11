import './App.css'
import { useTodos } from './hooks/useTodos'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'

function App() {
  const { todos, createTodo } = useTodos()

  return (
    <div className="app">
      <h1>Todo App</h1>
      <TaskInput onSubmit={createTodo} />
      <TaskList todos={todos} />
    </div>
  )
}

export default App
