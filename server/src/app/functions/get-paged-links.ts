import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'
import {
  type GetLinksInput,
  getLinksInput,
} from '@/infra/shared/schemas/get-links.schema'
import { asc, count, desc, ilike } from 'drizzle-orm'

type GetLinksOutput = {
  links: {
    id: string
    originalUrl: string
    shortUrl: string
    accessCount: number
    createdAt: Date
  }[]
  pagination: {
    number: number
    size: number
    hasPrevious: boolean
    hasNext: boolean
  }
  total: number
}

export async function getLinks(
  input: GetLinksInput
): Promise<Either<never, GetLinksOutput>> {
  const { page, pageSize, searchQuery, sortBy, sortDirection } =
    getLinksInput.parse(input)

  const [links, totalResult] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.originalUrl, `%${searchQuery}%`)
          : undefined
      )
      .orderBy(fields => {
        if (sortBy && sortDirection === 'asc') {
          return asc(fields[sortBy])
        }

        if (sortBy && sortDirection === 'desc') {
          return desc(fields[sortBy])
        }

        return desc(fields.createdAt)
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.links.id) })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.originalUrl, `%${searchQuery}%`)
          : undefined
      ),
  ])

  const total = totalResult[0]?.total || 0

  const totalPages = Math.ceil(total / pageSize)

  const pagination = {
    number: page,
    size: pageSize,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  }

  return makeRight({ links, pagination, total })
}
