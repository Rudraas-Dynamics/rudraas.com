import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050912] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
        // 404 — NOT FOUND
      </span>
      <h1 className="font-[family-name:var(--font-space-grotesk)] text-7xl md:text-9xl font-medium text-[#F2EFE6] mb-6">
        404
      </h1>
      <p className="text-[#D5D6D8] font-light mb-12 max-w-md leading-relaxed">
        This page does not exist or has been moved. Return to base.
      </p>
      <Link
        href="/"
        className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-all duration-300"
      >
        RETURN HOME
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </main>
  )
}
