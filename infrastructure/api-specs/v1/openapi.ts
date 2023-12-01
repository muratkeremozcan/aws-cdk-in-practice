import type {OpenAPIV3_1} from 'openapi-types'
import fs from 'fs'
import path from 'path'
import getTodosV1 from './getTodos.schema.json'
import deleteTodoV1 from './deleteTodo.schema.json'
import postTodoV1 from './postTodo.schema.json'
import putTodoV1 from './putTodo.schema.json'

export const openapi: OpenAPIV3_1.Document = {
  openapi: '3.0.1',
  info: {
    title: 'aws cdk in practice specification',
    version: '1.0.0',
  },
  paths: {
    '/': {
      get: {
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/getTodosV1',
                },
              },
            },
          },
        },
      },
      post: {
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/postTodoV1',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/postTodoV1',
                },
              },
            },
          },
        },
      },
      put: {
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/putTodoV1',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/putTodoV1',
                },
              },
            },
          },
        },
      },
    },
    '/{id}': {
      delete: {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/deleteTodoV1',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      getTodosV1: getTodosV1.definitions as OpenAPIV3_1.SchemaObject,

      deleteTodoV1: deleteTodoV1.definitions as OpenAPIV3_1.SchemaObject,

      postTodoV1: postTodoV1.definitions as OpenAPIV3_1.SchemaObject,

      putTodoV1: putTodoV1.definitions as OpenAPIV3_1.SchemaObject,
    },
  },
}

const filePath = path.join(__dirname, 'openapi.json')
fs.writeFileSync(filePath, JSON.stringify(openapi, null, 2))
