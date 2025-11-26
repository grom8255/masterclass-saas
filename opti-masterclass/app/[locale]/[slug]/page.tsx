// app/[locale]/[slug]/page.tsx
import ContentAreaMapper from '@/components/content-area/mapper';
import { optimizely } from '@/lib/optimizely/fetch';
import { getValidLocale } from '@/lib/optimizely/utils/language';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default async function CmsPage(props: {
  params: Promise<{ locale: string; slug?: string }>
}) {
  const { locale, slug = '' } = await props.params
  const locales = getValidLocale(locale)
  const formattedSlug = `/${slug}`

  const { data, errors } = await optimizely.getPageByURL({
    locales: [locales],
    slug: formattedSlug,
  })

  if (errors || !data?.CMSPage?.items?.[0]) {
    return notFound()
  }

  const page = data.CMSPage.items[0]
  const blocks = (page?.blocks ?? []).filter(
    (block) => block !== null && block !== undefined
  )

  return (
    <>
      <Suspense>
        <ContentAreaMapper blocks={blocks} />
      </Suspense>
    </>
  )
}