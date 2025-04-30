/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ResponseHeaders {
  [key: string]: any

  get(headerName: string): string | number
  get(headerName: string, parser: RegExp): RegExpExecArray | null
}

export interface RequestConfig {
  url: string
  method: string
  body?: any
  params?: any
  headers?: Record<string, string>
}

export type Request = {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  body?: any
  headers?: any
  params?: any
}

export interface Response<T> {
  headers: ResponseHeaders
  status: number
  data: T
}

export interface HttpClient {
  request<R = any>(config: RequestConfig): Promise<Response<R>>
}
