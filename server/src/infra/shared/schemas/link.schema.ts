import { z } from 'zod'

export const linkSchema = z.object({
  id: z.string().uuid(),
  originalUrl: z.string().url(),
  shortUrl: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  accessCount: z.number(),
  createdAt: z.date(),
})

export type LinkData = z.infer<typeof linkSchema>
