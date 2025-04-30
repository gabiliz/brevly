import { ApiError } from './error'

export function getApiErrorMessage(
  err?: unknown,
  options?: { defaultMessage?: string },
) {
  const isApiError = err instanceof ApiError

  if (isApiError) {
    const messages = err.messages

    if (messages && messages.length > 0) {
      return messages[0]
    } else {
      if (options?.defaultMessage) {
        return options.defaultMessage
      }
    }
  }
  return 'Ocorreu um erro inesperado'
}
