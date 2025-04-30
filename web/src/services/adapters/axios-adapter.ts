import {
  HttpClient,
  RequestConfig,
  Response,
  ResponseHeaders,
} from '@/types/http'
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { ApiError, ApiErrorData } from '../error'
import qs from 'qs'

export class AxiosHttpClientAdapter implements HttpClient {
  private axiosInstance: AxiosInstance
  constructor(_baseURL = '') {
    this.axiosInstance = axios.create({
      baseURL: _baseURL,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
    })
  }

  async request<R = unknown>(config: RequestConfig): Promise<Response<R>> {
    let axiosResponse: AxiosResponse | null = null
    try {
      axiosResponse = await this.axiosInstance.request<R>({
        url: config.url,
        method: config.method,
        data: config.body,
        params: config.params,
        headers: config.headers,
      })

      const response: Response<R> = {
        data: axiosResponse.data,
        status: axiosResponse.status,
        headers: axiosResponse.headers as ResponseHeaders,
      }

      return response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData, ApiErrorData>
        if (axiosError.response) {
          throw new ApiError({
            ...axiosError.response.data,
            status: axiosError.response.status,
          })
        }
      }
      throw error
    }
  }
}
