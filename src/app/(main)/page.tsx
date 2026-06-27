import { Hero } from "@/components/landing/Hero"
import { Showcase } from "@/components/landing/Showcase"
import { Labs } from "@/components/landing/Labs"
import { Faq } from "@/components/landing/Faq"

// Apex landing — layout wraps this in <Header> and <Footer>.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Labs />
      <Showcase />
      <Faq />
    </>
  )
}
