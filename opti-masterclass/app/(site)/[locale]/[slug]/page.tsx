// app/(site)/[locale]/[slug]/page.tsx
import ContentAreaMapper from '@/components/content-area/mapper'
import { optimizely } from '@/lib/optimizely/fetch'
import {
  getValidLocale,
  mapPathWithoutLocale,
} from '@/lib/optimizely/utils/language'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { generateAlternates } from '@/lib/utils/metadata'
import { Metadata } from 'next'

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug?: string }>
}): Promise<Metadata> {
  const { locale, slug = '' } = await props.params
  const locales = getValidLocale(locale)
  const formattedSlug = `/${slug}`
  const { data, errors } = await optimizely.getPageByURL({
    locales: [locales],
    slug: formattedSlug,
  })

  if (errors) {
    return {}
  }

  const page = data?.CMSPage?.items?.[0]
  if (!page) {
    const experienceData = await optimizely.GetVisualBuilderBySlug({
      locales: [locales],
      slug: formattedSlug,
    })

    const experience = experienceData.data?.SEOExperience?.items?.[0]

    if (experience) {
      return {
        title: experience?.title,
        description: experience?.shortDescription || '',
        keywords: experience?.keywords ?? '',
        alternates: generateAlternates(locale, formattedSlug),
      }
    }

    return {}
  }

  return {
    title: page.title,
    description: page.shortDescription || '',
    keywords: page.keywords ?? '',
    alternates: generateAlternates(locale, formattedSlug),
  }
}


export async function generateStaticParams() {
  try {
    const pageTypes = ['CMSPage', 'SEOExperience']
    const pathsResp = await optimizely.AllPages({ pageType: pageTypes })
  }
}

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
    const experienceData = await optimizely.GetVisualBuilderBySlug({
      locales: [locales],
      slug: formattedSlug,
    })

    const experience = experienceData.data?.SEOExperience?.items?.[0] as
      | SafeVisualBuilderExperience
      | undefined

    if (experience) {
      return (
        <Suspense>
          <VisualBuilderExperienceWrapper experience={experience} />
        </Suspense>
      )
    }

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