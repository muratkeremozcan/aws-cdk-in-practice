export {}
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Perform a CRUD operation.
       * @param {Object} options - The options object.
       * @param {('GET' | 'POST' | 'PUT' | 'DELETE')} options.method - The HTTP method.
       * @param {string} [options.url='/'] - The URL to send the request to. Default is '/'.
       * @param {Todo | object} [options.body] - The request body. Required for 'POST' and 'PUT' methods.
       * @param {boolean} [options.allowedToFail=false] - Whether the request is allowed to fail. Default is false.
       * @returns {Cypress.Chainable<Response<Todo[] & Todo> & Messages>}
       */
      crud({
        method,
        url,
        body,
        allowedToFail,
      }: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE'
        url?: string
        body?: Todo | object
        allowedToFail?: boolean
      }): Cypress.Chainable<Response<Todo[] & Todo> & Messages>
    }
  }
}
