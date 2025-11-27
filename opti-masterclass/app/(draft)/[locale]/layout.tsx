// app/(draft)/[locale]/layout.tsx

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src={`${process.env.NEXT_PUBLIC_CMS_URL}/util/javascript/communicationinjector.js`}
        />
        <DraftActions />
        <main className="container mx-auto px-4">{children}</main>
      </body>
    </html>
  )
}