import { getLinks } from '@/app/functions/get-paged-links'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import { getLinksInput } from '@/infra/shared/schemas/get-links.schema'
import { linkSchema } from '@/infra/shared/schemas/link.schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'Get a list of links',
        querystring: getLinksInput,
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: linkSchema.shape.id,
                originalUrl: linkSchema.shape.originalUrl,
                shortUrl: linkSchema.shape.shortUrl,
                accessCount: linkSchema.shape.accessCount,
                createdAt: linkSchema.shape.createdAt,
              })
            ),
            pagination: z.object({
              number: z.number(),
              size: z.number(),
              hasPrevious: z.boolean(),
              hasNext: z.boolean(),
            }),
            total: z.number(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getLinks(request.query)

      if (isLeft(result)) {
        return reply.status(400).send({ message: 'Failed to fetch links.' })
      }

      const { links, pagination, total } = unwrapEither(result)

      return reply.status(200).send({
        links,
        pagination,
        total,
      })
    }
  )
}
