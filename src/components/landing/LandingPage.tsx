import { Hero } from "./Hero"
import { Labs } from "./Labs"
import { Faq } from "./Faq"
import "@/styles/landing.css"

// Landing page sections — the (main) layout wraps these in the navbar and footer.
export function LandingPage() {
  return (
    <>
      <Hero />
      <Labs />
      <Faq />
    </>
  )
}
