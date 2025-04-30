import { httpClientFactory } from '@/services/factories/http-client-factory'
import { LinkService } from './links-service'

const httpClient = httpClientFactory('http://localhost:3333')

export const linkService = new LinkService(httpClient)
