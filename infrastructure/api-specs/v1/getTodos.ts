import {Todo} from 'customTypes/index'

// (1) Define the ResponseBody for the operation
export type ResponseBody = {
  todos: Todo[]
}
