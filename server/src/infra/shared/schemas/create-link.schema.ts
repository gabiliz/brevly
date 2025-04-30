import { z } from 'zod'
import { linkSchema } from './link.schema'

export const createLinkSchema = z.object({
  originalUrl: linkSchema.shape.originalUrl,
  shortUrl: linkSchema.shape.shortUrl,
})

export type CreateLinkData = z.infer<typeof createLinkSchema>
