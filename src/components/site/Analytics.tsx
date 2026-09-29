import Script from "next/script"

// Google Analytics (gtag), same setup as @next/third-parties' GoogleAnalytics but loaded in browser idle time
// after the page's own resources (lazyOnload), so it never competes with the landing's critical path.
export function Analytics({ gaId }: { gaId: string }) {
  const id = JSON.stringify(gaId)
  return (
    <>
      <Script id="ga-init" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config",${id});`}
      </Script>
      <Script id="ga" strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} />
    </>
  )
}
