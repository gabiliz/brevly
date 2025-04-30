import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import {
  type Either,
  isRight,
  makeLeft,
  makeRight,
} from '@/infra/shared/either'
import { ErrorMessages } from '@/infra/shared/error-message.enum'
import { createLinkSchema } from '@/infra/shared/schemas/create-link.schema'
import { type LinkData, linkSchema } from '@/infra/shared/schemas/link.schema'
import { getLinkByShortUrl } from './get-link'

export const createLink = async (
  originalUrl: string,
  shortUrl: string
): Promise<Either<ErrorMessages, LinkData>> => {
  const parsedInput = createLinkSchema.safeParse({ originalUrl, shortUrl })

  if (!parsedInput.success) {
    return makeLeft(ErrorMessages.INVALID_INPUT)
  }

  const existingLink = await getLinkByShortUrl(shortUrl)

  if (isRight(existingLink)) {
    return makeLeft(ErrorMessages.SHORT_URL_ALREADY_EXISTS)
  }

  const inserted = await db
    .insert(schema.links)
    .values({
      originalUrl,
      shortUrl,
      accessCount: 0,
    })
    .returning()

  const newLink = inserted[0]

  if (!newLink) {
    return makeLeft(ErrorMessages.INVALID_LINK_DATA)
  }

  const parsedLink = linkSchema.safeParse(newLink)

  if (!parsedLink.success) {
    return makeLeft(ErrorMessages.INVALID_LINK_DATA)
  }

  return makeRight(parsedLink.data)
}
