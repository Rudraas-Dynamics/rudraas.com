import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Careers } from '@/components/careers'
import { Footer } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'We are hiring defence engineers, operators, and intelligence. Send work, not a resume.',
}

export default function CareersPage() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <div className="pt-20">
        <Careers />
      </div>
      <Footer />
    </main>
  )
}
