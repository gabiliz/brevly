import { z } from 'zod'

export const getLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'originalUrl', 'shortUrl', 'accessCount'])
    .optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
})

export type GetLinksInput = z.input<typeof getLinksInput>
