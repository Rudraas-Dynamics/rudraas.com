import Link from 'next/link'
import { LayoutTextFlip } from '@/components/ui/layout-text-flip'

const routeCards = [
  {
    label: 'Capability',
    href: '/capabilities',
    number: '01',
    copy: 'The autonomy stack: intelligence fusion, computer vision, counter-UAS integration, and uncrewed aerial systems.',
  },
  {
    label: 'Mission',
    href: '/mission',
    number: '02',
    copy: 'The operating thesis behind Rudraas: sovereign autonomy, field-led engineering, and responsible human authority.',
  },
  {
    label: 'Sovereign',
    href: '/sovereign',
    number: '03',
    copy: 'Platform-agnostic, sensor-agnostic, payload-adaptable architecture under Indian control.',
  },
  {
    label: 'Careers',
    href: '/careers',
    number: '04',
    copy: 'For engineers, operators, and intelligence specialists who have shipped real systems.',
  },
  {
    label: 'Brief',
    href: '/contact',
    number: '05',
    copy: 'Programme, government, capital, partnership, and media enquiries.',
  },
]

export function HomeThesis() {
  return (
    <section className="py-24 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl lg:text-4xl font-medium text-[#F2EFE6] leading-snug">
            Built as a system.
          </h2>
          <p className="text-[#D5D6D8] font-normal leading-relaxed">
            Rudraas develops autonomous defence systems as integrated architecture: sensing, software, operators, payloads, and uncrewed platforms designed to work through a sovereign control plane.
          </p>
        </div>
      </div>
    </section>
  )
}

export function HomeRouteCards() {
  return (
    <section className="py-24 bg-[#050912]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-10 block">
          // EXPLORE
        </span>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a2233]">
          {routeCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-[#050912] p-8 md:p-10 hover:bg-[#0a0f1a] transition-all duration-200 flex flex-col hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] mb-6 block">
                {card.number}
              </span>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-[#F2EFE6] mb-4 group-hover:text-white transition-colors duration-200">
                {card.label}
              </h3>
              <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed flex-1">
                {card.copy}
              </p>
              <span className="mt-8 font-mono text-xs tracking-widest text-[#6A6E78] group-hover:text-[#D5D6D8] transition-colors duration-200 uppercase inline-flex items-center gap-1">
                ENTER
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeArgusTease() {
  return (
    <section className="py-24 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6A6E78] rd-pulse" />
              // ARGUS
            </span>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl lg:text-4xl font-medium text-[#F2EFE6] leading-snug mb-8">
              ARGUS connects the system.
            </h2>
          </div>
          <p className="text-[#D5D6D8] font-normal leading-relaxed self-end">
            The advantage is not in a single airframe, sensor, or payload. It is in the intelligence layer that structures information, supports decisions, and coordinates autonomous or operator-directed systems.
          </p>
        </div>
      </div>
    </section>
  )
}

export function HomeEngineeredDominance() {
  return (
    <div className="py-16 bg-[#050912] border-t border-[#1a2233]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-6xl lg:text-7xl font-medium text-[#F2EFE6] leading-tight flex flex-wrap items-center justify-center gap-4">
          <LayoutTextFlip
            text="Engineered"
            words={['Dominance.', 'Sovereignty.', 'Precision.', 'Advantage.']}
            duration={2800}
          />
        </div>
      </div>
    </div>
  )
}

export function HomeBriefingCTA() {
  return (
    <section className="py-24 bg-[#050912] border-t border-[#1a2233]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl lg:text-4xl font-medium text-[#F2EFE6] leading-snug mb-6">
              Briefings and strategic enquiries.
            </h2>
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              Rudraas engages with defence, government, capital, engineering, and strategic partners where the requirement is real and the standard is high.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-colors duration-200"
            >
              REQUEST BRIEFING
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
