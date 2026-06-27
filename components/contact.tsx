'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function Contact() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `mailto:info@rudraas.com?subject=Brief%20Request&body=From%3A%20${encodeURIComponent(email)}`
    setSubmitted(true)
  }

  const channels = [
    { label: 'PROGRAMME', value: 'programme@rudraas.in', note: 'Armed forces, development partnerships, programme enquiries' },
    { label: 'GENERAL', value: 'info@rudraas.com', note: 'Media, press, and general enquiries' },
  ]

  return (
    <section id="contact" className="relative py-32 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left content */}
          <div>
            <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
              // 006 — BRIEF REQUEST
            </span>

            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-4 leading-tight rd-enter-2">
              Operational.<br />Disciplined.<br />Direct.
            </h2>

            <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed mb-12 rd-enter-3">
              For programme, government, capital, partnership, and media enquiries.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-12 rd-enter-4">
              <label htmlFor="channel" className="block font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-3">
                EMAIL ADDRESS
              </label>
              {submitted ? (
                <p className="text-[#D5D6D8] font-mono text-sm tracking-wider py-4">
                  // TRANSMISSION SENT — WE WILL RESPOND.
                </p>
              ) : (
                <div className="flex gap-0">
                  <input
                    type="email"
                    id="channel"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@organization.com"
                    className="flex-1 bg-transparent border border-[#2a3344] border-r-0 px-4 py-4 text-[#F2EFE6] placeholder:text-[#6A6E78] focus:border-[#D5D6D8] focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm font-medium tracking-widest uppercase hover:bg-[#D5D6D8] transition-colors whitespace-nowrap"
                  >
                    TRANSMIT →
                  </button>
                </div>
              )}
            </form>

            {/* Channels */}
            <address className="not-italic grid sm:grid-cols-2 gap-6">
              {channels.map((channel) => (
                <div key={channel.label} className="border-l border-[#2a3344] pl-4 hover:border-[#6A6E78] transition-colors duration-200">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-1 block">
                    {channel.label}
                  </span>
                  <a
                    href={`mailto:${channel.value}`}
                    className="text-sm text-[#D5D6D8] hover:text-[#F2EFE6] transition-colors block mb-1"
                  >
                    {channel.value}
                  </a>
                  <span className="text-xs text-[#6A6E78] leading-relaxed">
                    {channel.note}
                  </span>
                </div>
              ))}
            </address>
          </div>

          {/* Right content */}
          <div className="hidden lg:flex flex-col justify-center gap-10">
            <p className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-medium text-[#F2EFE6] leading-snug">
              Designed in India.<br />Engineered for the allied world.
            </p>
            <div className="border-l border-[#2a3344] pl-8">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">OPERATING BASE</span>
              <p className="text-[#D5D6D8] font-normal leading-relaxed">
                Delhi NCR, India
              </p>
            </div>
            <div className="border-l border-[#2a3344] pl-8">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">ENGAGEMENTS</span>
              <p className="text-[#D5D6D8] font-normal leading-relaxed">
                Indian and allied defence requirements
              </p>
            </div>
            <div className="border-l border-[#2a3344] pl-8">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">POSTURE</span>
              <p className="text-[#D5D6D8] font-normal leading-relaxed">
                Sovereign by construction<br />Allied-ready by design
              </p>
            </div>
            <div className="border-l border-[#2a3344] pl-8">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">RESPONSE</span>
              <p className="text-[#D5D6D8] font-normal leading-relaxed">
                Direct review of relevant enquiries
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const surfaces = [
    { label: 'CAPABILITY', href: '/capabilities' },
    { label: 'THESIS', href: '/mission' },
    { label: 'SOVEREIGN', href: '/sovereign' },
    { label: 'CAREERS', href: '/careers' },
  ]

  const channels = [
    { label: 'BRIEF', href: '/contact' },
    { label: 'GOVERNMENT', href: 'mailto:ks@rudraas.com' },
    { label: 'CAPITAL', href: 'mailto:msu@rudraas.com' },
    { label: 'PRESS', href: 'mailto:info@rudraas.com' },
  ]

  return (
    <footer className="py-16 bg-[#050912] border-t border-[#1a2233]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/images/rudraas-emblem.png"
                alt="Rudraas Dynamics"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm tracking-widest text-[#F2EFE6] uppercase">
                RUDRAAS DYNAMICS
              </span>
            </div>
            <p className="font-mono text-xs tracking-wider text-[#6A6E78] uppercase">
              ENGINEERED DOMINANCE.
            </p>
          </div>

          {/* Surfaces */}
          <nav aria-label="Site sections">
            <h4 className="font-mono text-xs tracking-wider text-[#F2EFE6] uppercase mb-4 font-medium">
              SURFACES
            </h4>
            <ul className="space-y-2">
              {surfaces.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-mono text-xs tracking-wider text-[#6A6E78] hover:text-[#D5D6D8] transition-colors"
                  >
                    // {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Channels */}
          <nav aria-label="Contact channels">
            <h4 className="font-mono text-xs tracking-wider text-[#F2EFE6] uppercase mb-4 font-medium">
              CHANNELS
            </h4>
            <ul className="space-y-2">
              {channels.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('mailto:') ? (
                    <a
                      href={item.href}
                      className="font-mono text-xs tracking-wider text-[#6A6E78] hover:text-[#D5D6D8] transition-colors"
                    >
                      // {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="font-mono text-xs tracking-wider text-[#6A6E78] hover:text-[#D5D6D8] transition-colors"
                    >
                      // {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#1a2233] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-wider text-[#6A6E78] uppercase">
            <span className="font-medium text-[#D5D6D8]">R-DYN-WEB-26.05</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-wider text-[#6A6E78] uppercase">
            <span>NEW DELHI · INDIA</span>
            <span>© 2026 RUDRAAS DYNAMICS PVT. LTD.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
