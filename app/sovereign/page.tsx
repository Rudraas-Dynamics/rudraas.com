import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Sovereign } from '@/components/sovereign'
import { Footer } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Sovereign',
  description:
    'Indian defence technology by construction. Cap table, IP register, supply chain, and operating jurisdiction — all four are Indian.',
}

export default function SovereignPage() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <div className="pt-20">
        <Sovereign />
      </div>
      <Footer />
    </main>
  )
}
