'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050912]">
      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-8 left-8 w-8 h-8 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M0 16 L0 0 L16 0" />
        </svg>
        <svg className="absolute top-8 right-8 w-8 h-8 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M48 16 L48 0 L32 0" />
        </svg>
        <svg className="absolute bottom-8 left-8 w-8 h-8 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M0 32 L0 48 L16 48" />
        </svg>
        <svg className="absolute bottom-8 right-8 w-8 h-8 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M48 32 L48 48 L32 48" />
        </svg>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D5D6D8 1px, transparent 1px),
            linear-gradient(to bottom, #D5D6D8 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Top Label */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase">INDIA · 2026</span>
          <span className="text-[#6A6E78]">·</span>
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase">POSTURE STATEMENT</span>
        </div>

        {/* Emblem */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-8">
          <Image
            src="/images/rudraas-emblem.png"
            alt="Rudraas Dynamics Emblem"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Main Headline - LARGE */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium tracking-tight text-[#F2EFE6] mb-6 leading-[0.95]">
          <span className="sr-only">Rudraas Dynamics — India&apos;s Sovereign Defence Technology Company. AI Autonomy, Unmanned Systems &amp; Counter-UAS for the Indo-Pacific. </span>
          Engineered //<br />
          Dominance.
        </h1>

        {/* Description */}
        <p className="max-w-xl text-[#D5D6D8] text-base md:text-lg font-light leading-relaxed mb-10">
          The sovereign Indian defence platform — built for the Indo-Pacific, ready for the allied world.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <a
            href="#contact"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-all duration-300"
          >
            REQUEST BRIEFING
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#doctrine"
            className="text-sm tracking-widest text-[#D5D6D8] hover:text-[#F2EFE6] transition-colors uppercase"
          >
            READ THE THESIS
          </a>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] md:text-xs font-mono tracking-[0.15em] text-[#6A6E78] uppercase">
          <span>CLASSIFIED · DISTRIBUTION CONTROLLED</span>
          <span className="hidden sm:inline">//</span>
          <span className="hidden sm:inline">R-DYN-WEB-26.05</span>
          <span className="hidden sm:inline">//</span>
          <span>NEW DELHI · INDIA</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-[#6A6E78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
