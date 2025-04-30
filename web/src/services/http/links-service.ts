import { Link, LinkExportResponse, LinksPaginatedResponse } from '@/domain/link'
import { HttpClient } from '@/types/http'

export type ILinkService = {
  getPagedLinks(): Promise<LinksPaginatedResponse>
  getLink(shortUrl: string): Promise<Link>
  createLink(originalUrl: string, shortUrl: string): Promise<void>
  deleteLink(shortUrl: string): Promise<void>
  incrementLinkAccess(shortUrl: string): Promise<void>
  exportLinkData(): Promise<LinkExportResponse>
}

export class LinkService implements ILinkService {
  constructor(readonly httpClient: HttpClient) {}

  async getPagedLinks(): Promise<LinksPaginatedResponse> {
    const response = await this.httpClient.request<LinksPaginatedResponse>({
      url: '/links',
      method: 'get',
    })
    return response.data
  }

  async getLink(shortUrl: string): Promise<Link> {
    const response = await this.httpClient.request<Link>({
      url: `/links/${shortUrl}`,
      method: 'get',
    })
    return response.data
  }

  async createLink(originalUrl: string, shortUrl: string): Promise<void> {
    const response = await this.httpClient.request<void>({
      url: '/links',
      method: 'post',
      body: {
        originalUrl,
        shortUrl,
      },
    })
    return response.data
  }

  async deleteLink(shortUrl: string): Promise<void> {
    const response = await this.httpClient.request<void>({
      url: `/links/${shortUrl}`,
      method: 'delete',
    })
    return response.data
  }

  async incrementLinkAccess(shortUrl: string): Promise<void> {
    const response = await this.httpClient.request<void>({
      url: `/links/increment/${shortUrl}`,
      method: 'put',
    })
    return response.data
  }

  async exportLinkData(): Promise<LinkExportResponse> {
    const response = await this.httpClient.request<LinkExportResponse>({
      url: '/links/exports',
      method: 'post',
    })
    return response.data
  }
}
