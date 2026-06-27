import { Hero } from "./Hero"
import { Labs } from "./Labs"
import { Showcase } from "./Showcase"
import { Faq } from "./Faq"

// Landing page sections — layout wraps these in <Header> and <Footer>.
export function LandingPage() {
  return (
    <>
      <Hero />
      <Labs />
      <Showcase />
      <Faq />
    </>
  )
}
