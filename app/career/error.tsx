'use client'

import { useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/contact'

export default function CareerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />
      <section className="flex flex-col items-center justify-center px-6 py-40 text-center">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
          // ERROR — POSITIONS UNAVAILABLE
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl font-medium text-[#F2EFE6] mb-6 max-w-xl leading-tight">
          We could not load open positions.
        </h1>
        <p className="text-[#D5D6D8] font-light mb-12 max-w-md leading-relaxed">
          Our careers service is temporarily unreachable. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-colors duration-200"
        >
          TRY AGAIN
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </section>
      <Footer />
    </main>
  )
}
