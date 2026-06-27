import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Contact, Footer } from '@/components/contact'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Request a briefing. All enquiries are operational, disciplined, and confidential.',
}

export default function ContactPage() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  )
}
