import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { ErrorMessages } from '@/infra/shared/error-message.enum'
import { type LinkData, linkSchema } from '@/infra/shared/schemas/link.schema'
import { eq } from 'drizzle-orm'

export const getLinkByShortUrl = async (
  shortUrl: string
): Promise<Either<ErrorMessages, LinkData>> => {
  const link = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .then(res => res[0])

  if (!link) {
    return makeLeft(ErrorMessages.LINK_NOT_FOUND)
  }

  const parsed = linkSchema.safeParse(link)

  if (!parsed.success) {
    return makeLeft(ErrorMessages.INVALID_LINK_DATA)
  }

  return makeRight(parsed.data)
}
