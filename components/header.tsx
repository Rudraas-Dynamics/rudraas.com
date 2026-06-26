'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Capability', href: '/capabilities' },
    { label: 'Mission', href: '/mission' },
    { label: 'Sovereign', href: '/sovereign' },
    { label: 'Careers', href: '/careers' },
    { label: 'Brief', href: '/contact' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050912]/95 backdrop-blur-md border-b border-[#1a2233]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="relative">
            <Image
              src="/images/rudraas-logo-bone.png"
              alt="Rudraas Dynamics"
              width={240}
              height={48}
              className="object-contain"
              style={{ width: 'auto', height: '48px' }}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rd-nav-link text-xs font-medium text-[#D5D6D8] hover:text-[#F2EFE6] transition-colors duration-200 tracking-widest uppercase"
              >
                {item.label}
              </Link>
            ))}
            <span className="text-[10px] font-mono text-[#6A6E78] tracking-wider hidden lg:block">R-DYN-WEB-26.05</span>
          </div>

          {/* Request Briefing Button */}
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-[#D5D6D8] text-[#F2EFE6] text-xs tracking-widest uppercase hover:bg-[#F2EFE6] hover:text-[#050912] transition-all duration-300"
          >
            REQUEST BRIEFING <span>→</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#D5D6D8] hover:text-[#F2EFE6]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6 border-t border-[#1a2233] mt-2 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-xs font-medium text-[#D5D6D8] hover:text-[#F2EFE6] transition-colors tracking-widest uppercase"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 border border-[#D5D6D8] text-[#F2EFE6] text-xs tracking-widest uppercase"
            >
              REQUEST BRIEFING →
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
