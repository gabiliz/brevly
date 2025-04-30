import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { ErrorMessages } from '@/infra/shared/error-message.enum'
import { eq } from 'drizzle-orm'

export const deleteLinkByShortUrl = async (
  shortUrl: string
): Promise<Either<ErrorMessages, boolean>> => {
  const link = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .then(res => res[0])

  if (!link) {
    return makeLeft(ErrorMessages.LINK_NOT_FOUND)
  }

  await db.delete(schema.links).where(eq(schema.links.shortUrl, shortUrl))

  return makeRight(true)
}
