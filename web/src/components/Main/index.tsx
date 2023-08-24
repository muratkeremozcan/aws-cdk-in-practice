// ./web/src/components/Main/index.tsx

import React, {useEffect, useState} from 'react'
import axios from 'axios'

import {Interfaces} from '../../../@types/interfaces'

import {CreateTodo} from '../CreateTodo'
import {Todo} from '../Todo'

import {MainContainer} from './styles'

import config from '@web/outside-config/config.json'

const backend_url = `https://${
  process.env.REACT_APP_ENV === 'Production'
    ? config.backend_subdomain
    : config.backend_dev_subdomain
}.${config.domain_name}`

export const Main: React.FC = () => {
  const [todos, setTodos] = useState<Interfaces.Todo[]>([])

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await axios.get(backend_url)
      setTodos(response.data.todos)
    }
    fetchTodos()
  }, [])

  const handleTodoSubmit = async ({new_todo}: {new_todo: Interfaces.Todo}) => {
    const response = await axios.post(backend_url, {todo: new_todo})
    setTodos(current_todos => [...current_todos, response.data.todo])
  }

  const handleTodoDelete = async (id: string) => {
    try {
      await axios.delete(`${backend_url}/${id}`)
      setTodos(current_todos => current_todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting the todo:', error)
    }
  }

  const handleTodoEdit = async (updatedTodo: Interfaces.Todo) => {
    try {
      const response = await axios.put(`${backend_url}/${updatedTodo.id}`, {
        todo: updatedTodo,
      })
      // Assuming the backend returns the updated todo
      const editedTodo: Interfaces.Todo = response.data.todo
      // Update the local state with the edited todo
      setTodos(current_todos =>
        current_todos.map(todo =>
          todo.id === editedTodo.id ? editedTodo : todo,
        ),
      )
    } catch (error) {
      console.error('Error editing the todo:', error)
    }
  }

  const to_complete = todos.filter(todo => !todo.todo_completed).length
  const completed = todos.filter(todo => todo.todo_completed).length

  return (
    <MainContainer>
      <h1>Today</h1>
      <CreateTodo handleTodoSubmit={handleTodoSubmit} />
      <p>
        {completed}/{to_complete} completed
      </p>
      {todos.map(t => (
        <Todo
          key={t.id}
          todo={t}
          handleDelete={handleTodoDelete}
          handleEdit={handleTodoEdit}
        />
      ))}
    </MainContainer>
  )
}
