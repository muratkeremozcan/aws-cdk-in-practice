import spok from 'cy-spok'
import 'cypress-map'

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

    // TODO add backend assertions
    cy.intercept('POST', '*').as('post')
    cy.intercept('GET', '*').as('get')
    cy.intercept('PUT', '*').as('put')
    cy.intercept('DELETE', '*').as('delete')

    cy.get('[placeholder="name"]').type(todo.todo_name)
    cy.get('[placeholder="description"]').type(todo.todo_description)
    cy.contains('button', 'Add').click()
    cy.wait('@post')
      .its('response')
      .should(
        spok({
          statusCode: 200,
          body: {
            todo,
          },
        }),
      )

    const getTodoBtn = (button: 'Delete' | 'Edit') =>
      cy
        .contains('h1', todo.todo_name)
        .should('be.visible')
        .parent()
        .siblings()
        .children()
        .contains(button)

    getTodoBtn('Edit').click()
    const editedTodoDescription = String(`edited-${Cypress._.random(1000)}`)
    cy.get(`[value="${todo.todo_description}"]`)
      .clear()
      .type(editedTodoDescription, {delay: 0})
      .siblings()
      .contains('Save')
      .click()
    cy.wait('@put')
      .its('response')
      .should(
        spok({
          statusCode: 200,
          body: {
            todo: {
              ...todo,
              todo_description: editedTodoDescription,
            },
          },
        }),
      )

    getTodoBtn('Delete').click()
    cy.wait('@delete')
      .its('response')
      .should(
        spok({
          statusCode: 200,
          body: {
            message: 'Todo deleted successfully.',
          },
        }),
      )
  })
})
