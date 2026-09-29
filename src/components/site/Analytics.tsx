import Script from "next/script"
import { gtagBootScript } from "@/lib/consent"
import { ConsentBanner } from "./ConsentBanner"

// Google Analytics (gtag) under Consent Mode v2, loaded in browser idle time after the page's own
// resources (lazyOnload), so it never competes with the landing's critical path. The inline boot
// sets the denied defaults and the stored choice before gtag.js runs (see lib/consent).
export function Analytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script id="ga-init" strategy="lazyOnload">
        {gtagBootScript(gaId)}
      </Script>
      <Script id="ga" strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} />
      <ConsentBanner gaId={gaId} policyHref="/cookies" />
    </>
  )
}
