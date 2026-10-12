import { Html, Head, Main, NextScript } from 'next/document'

const ADSENSE_CLIENT = 'ca-pub-7933159179608841'

export default function Document({ __NEXT_DATA__ }) {
  // No ads inside the newsroom admin area.
  const showAds = !__NEXT_DATA__.page.startsWith('/newsroom')

  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/images/logo_dna63.png" />
        {showAds && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              crossOrigin="anonymous"
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
