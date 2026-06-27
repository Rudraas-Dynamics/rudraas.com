import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Capabilities } from '@/components/capabilities'
import { Footer } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Capabilities',
  description:
    'Four surfaces. One brain. One supply chain. AI autonomy, sensing and awareness, autonomous platforms, and counter-UAS — built and owned in India.',
}

export default function CapabilitiesPage() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <div className="pt-20">
        <Capabilities />
      </div>
      <Footer />
    </main>
  )
}
