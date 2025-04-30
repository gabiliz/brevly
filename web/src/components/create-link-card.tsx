import { useForm } from 'react-hook-form'
import { Button } from './common/button'
import { Input } from './common/input'
import { Label } from './common/label'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createLinkForm,
  CreateLinkForm,
} from '@/schemas/create-link-form.schema'
import { linkService } from '@/services/http'
import { Warning } from '@phosphor-icons/react/dist/icons/Warning'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/services/api-error-handler'

interface CreateLinkCardProps {
  refetch: () => void
}

export const CreateLinkCard = ({ refetch }: CreateLinkCardProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkForm>({ resolver: zodResolver(createLinkForm) })
  const handleSubmitForm = async (data: CreateLinkForm) => {
    try {
      await linkService.createLink(data.originalUrl, data.shortUrl)
      reset()
      refetch()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className='flex h-fit flex-col rounded-lg bg-gray-100 p-8'
    >
      <h1 className='mb-6 font-sans text-lg text-gray-600'>Novo link</h1>
      <div className='flex flex-col gap-4'>
        <div className='flex w-full flex-col-reverse gap-1.5'>
          <div className='flex items-center gap-2'>
            {errors.originalUrl?.message && (
              <>
                <Warning size={16} className='text-danger' />
                <p className='text-sm text-gray-500'>
                  {errors.originalUrl?.message}
                </p>
              </>
            )}
          </div>
          <Input
            type='url'
            inputId='originalUrl'
            placeholder='www.exemplo.com.br'
            inputStatus={errors.originalUrl?.message ? 'error' : 'normal'}
            {...register('originalUrl')}
          />
          <Label
            inputId='originalUrl'
            inputStatus={errors.originalUrl?.message ? 'error' : 'normal'}
          >
            LINK ORIGINAL
          </Label>
        </div>
        <div className='flex w-full flex-col-reverse gap-1.5'>
          <div className='flex items-center gap-2'>
            {errors.shortUrl?.message && (
              <>
                <Warning size={16} className='text-danger' />
                <p className='text-sm text-gray-500'>
                  {errors.shortUrl?.message}
                </p>
              </>
            )}
          </div>
          <Input
            type='text'
            inputId='shortUrl'
            placeholder='brev.ly/'
            inputStatus={errors.shortUrl?.message ? 'error' : 'normal'}
            {...register('shortUrl')}
          />
          <Label
            inputId='shortUrl'
            inputStatus={errors.shortUrl?.message ? 'error' : 'normal'}
          >
            LINK ENCURTADO
          </Label>
        </div>
      </div>
      <Button
        type='submit'
        className='text-md mt-6 py-4'
        loading={isSubmitting}
      >
        Salvar link
      </Button>
    </form>
  )
}
