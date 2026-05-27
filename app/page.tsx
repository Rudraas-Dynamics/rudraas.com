import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Doctrine } from '@/components/doctrine'
import { Sovereign } from '@/components/sovereign'
import { Capabilities } from '@/components/capabilities'
import { Careers } from '@/components/careers'
import { Contact, Footer } from '@/components/contact'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Doctrine />
      <Sovereign />
      <Capabilities />
      <Careers />
      <Contact />
      <Footer />
    </main>
  )
}
