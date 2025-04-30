import { getLinkByShortUrl } from '@/app/functions/get-link'
import { isLeft } from '@/infra/shared/either'
import { linkSchema } from '@/infra/shared/schemas/link.schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getLinkByShortUrlRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Get link by short URL',
        params: z.object({
          shortUrl: linkSchema.shape.shortUrl,
        }),
        response: {
          200: z.object({
            id: linkSchema.shape.id,
            originalUrl: linkSchema.shape.originalUrl,
            shortUrl: linkSchema.shape.shortUrl,
            accessCount: linkSchema.shape.accessCount,
            createdAt: linkSchema.shape.createdAt,
          }),
          404: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await getLinkByShortUrl(shortUrl)

      if (isLeft(result)) {
        return reply.status(400).send({ message: result.left })
      }

      return reply.status(200).send(result.right)
    }
  )
}
