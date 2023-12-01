import {httpResponse} from '../../handlers/httpResponse'

export const handler = async () => {
  try {
    return httpResponse(200, JSON.stringify('OK'))
  } catch (error) {
    const e = error as Error
    console.error(e)

    return httpResponse(400, JSON.stringify({message: e.message}))
  }
}
