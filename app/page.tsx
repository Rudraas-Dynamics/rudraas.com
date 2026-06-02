import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Doctrine } from '@/components/doctrine'
import { Sovereign } from '@/components/sovereign'
import { Capabilities } from '@/components/capabilities'
import { Careers } from '@/components/careers'
import { Contact, Footer } from '@/components/contact'

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Rudraas Dynamics',
  description:
    "India's sovereign defence-technology company building AI autonomy, unmanned platforms, sensing systems, and counter-UAS capabilities for the Indo-Pacific theatre.",
  url: 'https://rudraas.com',
  logo: 'https://rudraas.com/images/rudraas-emblem.png',
  image: 'https://rudraas.com/images/rudraas-emblem.png',
  email: 'info@rudraas.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.6139,
    longitude: 77.209,
  },
  areaServed: [
    { '@type': 'Country', name: 'India' },
    { '@type': 'Place', name: 'Indo-Pacific' },
  ],
  knowsAbout: [
    'AI Autonomy',
    'Unmanned Aerial Vehicles',
    'Counter-UAS Systems',
    'Defence Technology',
    'Autonomous Platforms',
    'Electronic Warfare',
    'Mission Planning',
    'Perception Systems',
  ],
  sameAs: ['https://rudraas.com'],
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
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
