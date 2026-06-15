import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import SelfHost from "@/components/landing/SelfHost"
import OpenSource from "@/components/landing/OpenSource"
import Faq from "@/components/landing/Faq"

// Apex landing — Cryo-Vault, static-export safe.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <SelfHost />
      <OpenSource />
      <Faq />
    </>
  )
}
