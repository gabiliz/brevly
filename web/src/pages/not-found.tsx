export function NotFound() {
  return (
    <div className='flex min-h-screen w-screen items-center justify-center px-3'>
      <div className='flex max-w-[580px] flex-col items-center gap-6 rounded-lg bg-gray-100 px-12 py-16'>
        <img src='/404.svg' alt='404 Not Found' className='h-20 w-48' />
        <h1 className='text-xl text-gray-600'>Link não encontrado</h1>
        <p className='text-md text-center text-gray-500'>
          O link que você está tentando acessar não existe, foi removido ou é
          uma URL inválida. Saiba mais em{' '}
          <a href='/' className='text-blue-base underline'>
            brev.ly
          </a>
        </p>
      </div>
    </div>
  )
}
