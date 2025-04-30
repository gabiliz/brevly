import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, isLeft, makeLeft, makeRight } from '@/infra/shared/either'
import { ErrorMessages } from '@/infra/shared/error-message.enum'
import { eq } from 'drizzle-orm'
import { getLinkByShortUrl } from './get-link'

export const incrementLinkAccess = async (
  shortUrl: string
): Promise<Either<ErrorMessages, boolean>> => {
  const result = await getLinkByShortUrl(shortUrl)

  if (isLeft(result)) {
    return makeLeft(ErrorMessages.LINK_NOT_FOUND)
  }

  const link = result.right

  const updated = await db
    .update(schema.links)
    .set({
      accessCount: link.accessCount + 1,
    })
    .where(eq(schema.links.shortUrl, shortUrl))

  if (updated.count === 0) {
    return makeLeft(ErrorMessages.UPDATE_FAILED)
  }

  return makeRight(true)
}
