import { Pagination } from '@/types/pagination'

export interface Link {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: Date
}

export interface LinksPaginatedResponse {
  links: Link[]
  total: number
  page: Pagination
}

export interface LinkExportResponse {
  reportUrl: string
}
