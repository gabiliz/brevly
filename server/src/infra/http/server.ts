import { fastifyCors } from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createLinkRoute } from './routes/create-link'
import { deleteLinkRoute } from './routes/delete-link'
import { exportLinksRoute } from './routes/export-links'
import { getLinkByShortUrlRoute } from './routes/get-link'
import { getLinksRoute } from './routes/get-paged-links'
import { incrementLinkAccessRoute } from './routes/increment-link-access'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})

server.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brevly API',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(createLinkRoute)
server.register(getLinksRoute)
server.register(getLinkByShortUrlRoute)
server.register(incrementLinkAccessRoute)
server.register(deleteLinkRoute)
server.register(exportLinksRoute)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})
