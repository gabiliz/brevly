type ApiErrorDataError = {
  code: string
  message: string
}

export type ApiErrorData = {
  status: number
  title?: string
  type?: string
  errors?: ApiErrorDataError[]
  messages?: string[]
  Message?: string
  message?: string
  detail?: string
}

export class ApiError extends Error implements ApiErrorData {
  status: number
  title?: string
  type?: string
  errors?: ApiErrorDataError[]
  messages?: string[]

  private getMessages(errors?: ApiErrorDataError[]) {
    const localMessages = errors
      ? errors.map((message) => message.message)
      : undefined

    return localMessages
  }

  constructor(data: ApiErrorData) {
    super(data.detail)
    this.status = data.status
    this.title = data.title
    this.type = data.type
    this.errors = data.errors
    this.message = data.Message || data.message || data.detail || ''
    this.messages = this.getMessages(data.errors) || [this.message]

    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
