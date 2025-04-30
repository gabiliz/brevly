import { deleteLinkByShortUrl } from '@/app/functions/delete-link'
import { isLeft } from '@/infra/shared/either'
import { linkSchema } from '@/infra/shared/schemas/link.schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const deleteLinkRoute: FastifyPluginAsyncZod = async server => {
  server.delete(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Delete link',
        params: z.object({
          shortUrl: linkSchema.shape.shortUrl,
        }),
        response: {
          200: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await deleteLinkByShortUrl(request.params.shortUrl)

      if (isLeft(result)) {
        return reply.status(404).send({ message: result.left })
      }

      return reply.status(200).send({
        message: 'Link encurtado deletado com sucesso.',
      })
    }
  )
}
