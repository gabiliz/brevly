import { z } from 'zod'

export const createLinkForm = z.object({
  originalUrl: z.string().url('Informe uma url válida.'),
  shortUrl: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Informe uma url minúscula e sem espaço/caracter especial.',
    ),
})

export type CreateLinkForm = z.infer<typeof createLinkForm>
