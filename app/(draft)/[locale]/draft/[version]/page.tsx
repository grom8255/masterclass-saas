// app/(draft)/[locale]/draft/[version]/page.tsx
import ContentAreaMapper from '@/components/content-area/mapper'
import OnPageEdit from '@/components/draft/on-page-edit'
import { optimizely } from '@/lib/optimizely/fetch'
import { getValidLocale } from '@/lib/optimizely/utils/language'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { checkDraftMode } from '@/lib/utils/draft-mode'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function HomePage(props: {
  params: Promise<{ locale: string; version: string }>
  searchParams: Promise<{ token: string }>
}) {
  const isDraftModeEnabled = await checkDraftMode()
  if (!isDraftModeEnabled) {
    return notFound()
  }

  const { locale, version } = await props.params
  const { token } = await props.searchParams
  const locales = getValidLocale(locale)
  const pageResponse = await optimizely.GetPreviewStartPage(
    { locales, version },
    { preview: true, previewToken: token }
  )
  const startPage = pageResponse.data?.StartPage?.item
  const blocks = (startPage?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  return (
    <div data-epi-edit="blocks">
      <OnPageEdit
        version={version}
        currentRoute={`/${locale}/draft/${version}`}
      />
      <Suspense>
        <ContentAreaMapper blocks={blocks} preview />
      </Suspense>
    </div>
  )
}
