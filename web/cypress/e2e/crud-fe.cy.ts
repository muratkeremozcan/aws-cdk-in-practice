type Todo = {
  id?: string
  todo_name: string
  todo_description: string
  todo_completed: boolean
}

describe('CRUD', () => {
  const todo: Todo = {
    todo_completed: false,
    todo_description: String(Cypress._.random(1000)),
    todo_name: String(Cypress._.random(1000)),
  }
  it('should crud the front end', () => {
    cy.visit('/')

    cy.get('[placeholder="name"]').type(todo.todo_name)
    cy.get('[placeholder="description"]').type(todo.todo_description)
  })
})
