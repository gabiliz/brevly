import { createLink } from '@/app/functions/create-link'
import { isLeft } from '@/infra/shared/either'
import { createLinkSchema } from '@/infra/shared/schemas/create-link.schema'
import { linkSchema } from '@/infra/shared/schemas/link.schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create a new link',
        body: createLinkSchema,
        response: {
          200: z.object({ id: linkSchema.shape.id }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await createLink(
        request.body.originalUrl,
        request.body.shortUrl
      )

      if (isLeft(result)) {
        return reply.status(400).send({ message: result.left })
      }

      return reply.status(200).send({ id: result.right.id })
    }
  )
}
