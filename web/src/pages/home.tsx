import { useQuery } from '@tanstack/react-query'
import { DownloadSimple } from '@phosphor-icons/react/dist/icons/DownloadSimple'
import { Link } from '@phosphor-icons/react/dist/icons/Link'
import { linkService } from '@/services/http'
import { Button } from '@/components/common/button'
import { LinkRow } from '@/components/link-row'
import { useState } from 'react'
import { CreateLinkCard } from '@/components/create-link-card'

export function Home() {
  const [isLoadingCSVDownload, setIsLoadingCSVDownload] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['links'],
    queryFn: () => linkService.getPagedLinks(),
  })

  const handleDownloadCSV = async () => {
    try {
      setIsLoadingCSVDownload(true)
      const downloadUrl = await linkService.exportLinkData()

      const anchor = document.createElement('a')
      anchor.href = downloadUrl.reportUrl
      anchor.download = ''
      anchor.target = '_blank'
      anchor.click()

      anchor.remove()
      setIsLoadingCSVDownload(false)
    } catch (error) {
      console.error('Failed to export link data:', error)
    }
  }

  const handleDeleteShortUrl = async (shortUrl: string) => {
    await linkService.deleteLink(shortUrl)
    refetch()
  }

  const noData = !data || data.links.length === 0

  return (
    <div className='flex py-8 lg:min-h-screen lg:w-screen lg:items-center lg:justify-center'>
      <div className='w-full lg:max-w-6xl'>
        <div className='flex flex-col gap-6 lg:gap-8'>
          <div className='flex justify-center lg:justify-start'>
            <img
              src='/brevly-logo.svg'
              alt='Brevly logo'
              className='h-6 w-24'
            />
          </div>
          <div className='grid gap-5 px-3 lg:grid-cols-2'>
            <CreateLinkCard refetch={refetch} />
            <div className='h-fit max-h-[700px] overflow-y-auto rounded-lg bg-gray-100 p-8'>
              <div className='mb-5 flex items-center justify-between'>
                <h1 className='font-sans text-lg text-gray-600'>Meus links</h1>
                <Button
                  variant='secondary'
                  className='gap-1.5 p-2 text-sm font-semibold'
                  onClick={handleDownloadCSV}
                  disabled={noData}
                  loading={isLoadingCSVDownload}
                >
                  {!isLoadingCSVDownload && (
                    <DownloadSimple
                      size={16}
                      className={`${noData ? 'text-gray-400' : 'text-gray-600'} `}
                    />
                  )}
                  Baixar CSV
                </Button>
              </div>
              <div>
                {data?.links.map(
                  (link: {
                    accessCount: number
                    originalUrl: string
                    shortUrl: string
                  }) => (
                    <div className='mt-4' key={link.shortUrl}>
                      <div className='mb-4 h-[1px] w-full bg-gray-200' />
                      <LinkRow
                        accessCount={link.accessCount}
                        originalUrl={link.originalUrl}
                        shortUrl={link.shortUrl}
                        onDelete={() => handleDeleteShortUrl(link.shortUrl)}
                        refetch={refetch}
                      />
                    </div>
                  ),
                )}
                {noData && (
                  <div className='mt-4 flex flex-col items-center justify-center'>
                    <div className='mb-4 h-[1px] w-full bg-gray-200' />
                    <Link size={32} className='mt-8 mb-3 text-gray-400' />
                    <p className='mb-6 text-xs text-gray-500'>
                      AINDA NÃO EXITEM LINKS CADASTRADOS
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
