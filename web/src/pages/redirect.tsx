import { linkService } from '@/services/http'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function Redirect() {
  const { shortUrl } = useParams()
  const navigate = useNavigate()

  const { data, error } = useQuery({
    queryKey: ['link', shortUrl],
    queryFn: () => linkService.getLink(shortUrl as string),
  })

  if (error) {
    navigate(`/${shortUrl}/not-found`)
  }

  useEffect(() => {
    if (data) {
      window.location.href = data.originalUrl
    }
  }, [data, shortUrl])

  return (
    <div className='flex min-h-screen w-screen items-center justify-center px-3'>
      <div className='flex flex-col items-center gap-6 rounded-lg bg-gray-100 px-12 py-16'>
        <img src='/brevly-icon.svg' alt='Brevly logo' className='h-12 w-12' />
        <h1 className='text-xl text-gray-600'>Redirecionando...</h1>
        <div className='flex flex-col items-center gap-1'>
          <p className='text-md text-center text-gray-500'>
            O link será aberto automaticamente em alguns instantes.
          </p>
          <p className='text-md text-center text-gray-500'>
            Não foi redirecionado?{' '}
            <a href='/' className='text-blue-base underline'>
              Acesse aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
