import 'cypress-map'
import spok from 'cy-spok'
import {faker} from '@faker-js/faker'
import type {Todo} from 'customTypes/index'

Cypress.Commands.add(
  'crud',
  ({
    method,
    url = '/',
    body,
    allowedToFail = false,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    url?: string
    body?: Todo
    allowedToFail?: boolean
  }) => {
    cy.log(`**${method}`)
    return cy.api<Todo[] & Todo>({
      method,
      url,
      body: method === 'POST' || method === 'PUT' ? body : undefined,
      retryOnStatusCodeFailure: !allowedToFail,
      failOnStatusCode: !allowedToFail,
    })
  },
)

describe('template spec', () => {
  it('passes', () => {
    const todo: Todo = {
      todo_completed: false,
      todo_description: faker.lorem.sentence(),
      todo_name: faker.lorem.words(),
    }

    cy.crud({
      method: 'POST',
      body: {
        todo,
      },
    })

    cy.crud({
      method: 'GET',
    })
      .its('body.todos')
      .findOne({todo_name: todo.todo_name})
      .should(spok(todo))
      .its('id')
      .then((id: string) => {
        const editedTodo: Todo = {
          id,
          ...todo,
          todo_completed: true,
        }

        cy.crud({
          method: 'PUT',
          url: `/${id}`,
          body: editedTodo,
        }).should(
          spok({
            status: 200,
            body: {
              todo: editedTodo,
            },
          }),
        )

        cy.crud({
          method: 'GET',
        })
          .its('body.todos')
          .findOne({id})
          .should(spok(editedTodo))

        cy.crud({
          method: 'DELETE',
          url: `/${id}`,
        }).should(
          spok({
            status: 200,
            body: {
              message: 'Todo deleted successfully.',
            },
          }),
        )
      })
  })
})
