import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Doctrine } from '@/components/doctrine'
import { Footer } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Mission',
  description:
    'The Rudraas Dynamics doctrine — why software compounds, why sovereignty must be encoded into the topology of the company, and why the Indo-Pacific is the proving ground.',
}

export default function MissionPage() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <div className="pt-20">
        <Doctrine />
      </div>
      <Footer />
    </main>
  )
}
