import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
})

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rudraas Dynamics',
  url: 'https://rudraas.com',
  logo: 'https://rudraas.com/images/rudraas-emblem.png',
  description:
    "India's sovereign defence-technology company building AI autonomy, unmanned platforms, sensing systems, and counter-UAS capabilities for the Indo-Pacific theatre.",
  foundingLocation: {
    '@type': 'Place',
    name: 'New Delhi, India',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  areaServed: ['India', 'Indo-Pacific', 'United States', 'Gulf'],
  knowsAbout: [
    'AI Autonomy',
    'Unmanned Aerial Vehicles',
    'Counter-UAS',
    'Defence Technology',
    'Autonomous Systems',
    'Electronic Warfare',
    'Mission Planning Software',
    'Perception Systems',
    'Sovereign Defence Platform',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: 'info@rudraas.com',
      contactType: 'customer support',
    },
    {
      '@type': 'ContactPoint',
      email: 'ks@rudraas.com',
      contactType: 'government relations',
    },
    {
      '@type': 'ContactPoint',
      email: 'msu@rudraas.com',
      contactType: 'investor relations',
    },
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rudraas Dynamics',
  url: 'https://rudraas.com',
  description:
    "India's sovereign defence-technology company — AI autonomy, unmanned platforms, and counter-UAS systems.",
  inLanguage: 'en-IN',
  publisher: {
    '@type': 'Organization',
    name: 'Rudraas Dynamics',
  },
}

export const metadata: Metadata = {
  applicationName: 'Rudraas Dynamics',
  title: {
    default: 'Rudraas Dynamics | Indian Defence Technology & AI Autonomy',
    template: '%s | Rudraas Dynamics',
  },
  description:
    "Rudraas Dynamics is India's sovereign defence-technology company building AI autonomy, unmanned platforms, sensing systems, and counter-UAS capabilities for the Indo-Pacific theatre.",
  keywords: [
    'Indian defence technology',
    'autonomous drones India',
    'counter-UAS India',
    'AI autonomy defence',
    'unmanned systems India',
    'sovereign defence platform',
    'Indo-Pacific defence',
    'iDEX defence startup',
    'Indian military technology',
    'defence tech startup India',
    'Rudraas Dynamics',
    'New Delhi defence company',
  ],
  authors: [{ name: 'Rudraas Dynamics', url: 'https://rudraas.com' }],
  creator: 'Rudraas Dynamics',
  publisher: 'Rudraas Dynamics',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://rudraas.com',
  },
  appleWebApp: {
    title: 'Rudraas Dynamics',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    url: 'https://rudraas.com',
    siteName: 'Rudraas Dynamics',
    title: 'Rudraas Dynamics | Indian Defence Technology & AI Autonomy',
    description:
      "India's sovereign defence-technology company — AI autonomy, unmanned platforms, and counter-UAS systems built for the Indo-Pacific.",
    images: [
      {
        url: '/images/rudraas-emblem.png',
        width: 512,
        height: 512,
        alt: 'Rudraas Dynamics — Indian Defence Technology',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rudraas Dynamics | Indian Defence Technology & AI Autonomy',
    description:
      "India's sovereign defence-technology company — AI autonomy, unmanned platforms, and counter-UAS systems built for the Indo-Pacific.",
    images: ['/images/rudraas-emblem.png'],
  },
  icons: {
    icon: [{ url: '/images/rudraas-emblem.png', type: 'image/png' }],
    shortcut: '/images/rudraas-emblem.png',
    apple: [{ url: '/images/rudraas-emblem.png', type: 'image/png' }],
  },
}

export const viewport = {
  themeColor: '#050912',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="geo.region" content="IN-DL" />
        <meta name="geo.placename" content="New Delhi, India" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />
      </head>
      <body className="font-sans antialiased bg-[#050912]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
