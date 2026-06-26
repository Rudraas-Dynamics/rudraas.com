'use client'

import { useEffect, useRef, useState } from 'react'

const domainIcons = {
  fusion: (
    <svg aria-hidden="true" className="w-10 h-10 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="24" cy="24" r="4" />
      <circle cx="8" cy="14" r="3" />
      <circle cx="40" cy="14" r="3" />
      <circle cx="8" cy="34" r="3" />
      <circle cx="40" cy="34" r="3" />
      <circle cx="24" cy="6" r="3" />
      <circle cx="24" cy="42" r="3" />
      <line x1="20" y1="24" x2="11" y2="14" />
      <line x1="28" y1="24" x2="37" y2="14" />
      <line x1="20" y1="24" x2="11" y2="34" />
      <line x1="28" y1="24" x2="37" y2="34" />
      <line x1="24" y1="20" x2="24" y2="9" />
      <line x1="24" y1="28" x2="24" y2="39" />
    </svg>
  ),
  vision: (
    <svg aria-hidden="true" className="w-10 h-10 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
      <ellipse cx="24" cy="24" rx="20" ry="12" />
      <circle cx="24" cy="24" r="5" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      <path d="M4 24 Q12 8 24 8 Q36 8 44 24" strokeDasharray="3 3" />
      <path d="M4 24 Q12 40 24 40 Q36 40 44 24" strokeDasharray="3 3" />
    </svg>
  ),
  cuas: (
    <svg aria-hidden="true" className="w-10 h-10 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="8" />
      <line x1="24" y1="6" x2="24" y2="16" />
      <line x1="24" y1="32" x2="24" y2="42" />
      <line x1="6" y1="24" x2="16" y2="24" />
      <line x1="32" y1="24" x2="42" y2="24" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  platform: (
    <svg aria-hidden="true" className="w-10 h-10 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M24 20 L44 28 L38 30 L24 26 L10 30 L4 28 Z" />
      <path d="M24 20 L28 10 L30 10 L28 20" />
      <path d="M24 26 L26 38 L24 36 L22 38 Z" />
      <line x1="24" y1="20" x2="24" y2="26" />
    </svg>
  ),
}

const domains = [
  {
    id: 'fusion',
    number: '01',
    title: 'Intelligence & OSINT Fusion',
    description:
      'A mission intelligence layer that turns open sources, live feeds, sensor inputs, and operational context into a coherent decision-support picture.',
    icon: domainIcons.fusion,
  },
  {
    id: 'vision',
    number: '02',
    title: 'Autonomy & Computer Vision',
    description:
      'Edge perception, classification, navigation support, and machine understanding for uncrewed and mission-critical systems.',
    icon: domainIcons.vision,
  },
  {
    id: 'cuas',
    number: '03',
    title: 'Counter-UAS Systems',
    description:
      'Detection, tracking, classification, and response-layer integration for hostile or unauthorised unmanned aerial systems.',
    icon: domainIcons.cuas,
  },
  {
    id: 'platform',
    number: '04',
    title: 'Uncrewed Aerial Systems',
    description:
      'Airframe, electronics, control, payload, and mission-system integration for aerial systems designed around operational requirements.',
    icon: domainIcons.platform,
  },
]

const platformBlocks = [
  {
    title: 'ISR Platforms',
    description: 'Persistent sensing, classification, and reconnaissance-oriented aerial systems.',
  },
  {
    title: 'Attritable Aerial Systems',
    description: 'Mission-configurable aerial platforms designed around speed, cost discipline, and repeatability.',
  },
  {
    title: 'Counter-UAS Platforms',
    description: 'Interceptor and response-layer systems designed to integrate with wider sensing and command architecture.',
  },
  {
    title: 'Payload & Mission Integration',
    description: 'Payload-adaptable architecture for changing mission needs without rebuilding the whole system.',
  },
]

export function Capabilities() {
  const [visibleItems, setVisibleItems] = useState<string[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id')
            if (id) {
              setVisibleItems((prev) => prev.includes(id) ? prev : [...prev, id])
            }
          }
        })
      },
      { threshold: 0.15 }
    )

    const items = sectionRef.current?.querySelectorAll('[data-id]')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="capability" ref={sectionRef} className="relative py-32 bg-[#050912]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
          // 003 — CAPABILITY
        </span>

        {/* Headline */}
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 max-w-4xl leading-tight rd-enter-2">
          One stack, end to end: sensing, intelligence, autonomy, and uncrewed systems.
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl font-normal text-[#D5D6D8] mb-16 max-w-3xl leading-relaxed rd-enter-3">
          Rudraas builds the intelligence layer, mission software, and uncrewed systems architecture that turn sensing into decision advantage and mission-ready autonomous systems.
        </p>

        {/* Main body */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 rd-enter-4">
          <p className="text-[#D5D6D8] font-normal leading-relaxed">
            Modern defence systems cannot be treated as isolated hardware. Sensors, platforms, autonomy, payloads, and operators must compose into one mission system.
          </p>
          <p className="text-[#D5D6D8] font-normal leading-relaxed">
            Rudraas is building that system: a sovereign autonomy stack that fuses information, supports decisions, coordinates uncrewed systems, and adapts across platforms, payloads, and mission requirements.
          </p>
        </div>

        {/* Capability Domains */}
        <div className="mb-24">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
            // CAPABILITY DOMAINS
          </span>
          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain, index) => (
              <article
                key={domain.id}
                data-id={domain.id}
                className={`group relative p-8 md:p-10 bg-[#0a0f1a] border border-[#1a2233] hover:border-[#4a5566] transition-all duration-500 ${
                  visibleItems.includes(domain.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] mb-6 block">
                  {domain.number}
                </span>
                <div className="w-12 h-12 mb-6 flex items-center justify-center">
                  {domain.icon}
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-[#F2EFE6] mb-4">
                  {domain.title}
                </h3>
                <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                  {domain.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ARGUS */}
        <div className="mb-24 p-10 md:p-12 bg-[#0a0f1a] border border-[#1a2233]">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // ARGUS
          </span>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-3xl font-medium text-[#F2EFE6] mb-6 leading-snug">
            ARGUS — the mission intelligence layer.
          </h3>
          <p className="text-[#D5D6D8] font-normal leading-relaxed mb-4 max-w-3xl">
            ARGUS is the intelligence layer of the Rudraas stack: a software system designed to ingest fragmented information, structure it into an operational picture, and support decisions across autonomous and operator-directed systems.
          </p>
          <p className="text-[#D5D6D8] font-normal leading-relaxed mb-10 max-w-3xl">
            It is designed to be platform-agnostic, sensor-agnostic, and payload-adaptable — allowing the same intelligence layer to support existing systems, future platforms, and mission-specific configurations.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l border-[#2a3344] pl-6">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">
                ARGUS INTELLIGENCE
              </span>
              <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                An OSINT and sensor-fusion environment for turning open sources, live feeds, imagery, telemetry, and mission context into structured intelligence. The objective is not another dashboard. It is an operational ontology that helps teams understand what is happening, what matters, and what should be watched next.
              </p>
            </div>
            <div className="border-l border-[#2a3344] pl-6">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">
                ARGUS COMMAND
              </span>
              <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                A mission-command layer for planning, tasking, coordination, and cooperative engagement chains across uncrewed systems. ARGUS Command is designed to support sensor-to-effector coordination, operator-authorised response workflows, and system-level orchestration without locking the user to a single platform or vendor ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Family */}
        <div className="mb-16">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // SYSTEMS BUILT TO COMPOSE
          </span>
          <p className="text-[#D5D6D8] font-normal leading-relaxed mb-10 max-w-3xl">
            Rudraas platform programmes are built around a common intelligence layer rather than isolated airframes. The objective is a family of uncrewed systems that can sense, carry, coordinate, and respond through the same mission architecture.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {platformBlocks.map((block) => (
              <div key={block.title} className="pt-6 border-t border-[#1a2233] hover:border-[#4a5566] transition-colors duration-200">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-[#F2EFE6] mb-3">
                  {block.title}
                </h3>
                <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer line */}
        <p className="font-mono text-xs tracking-[0.15em] text-[#6A6E78] uppercase border-t border-[#1a2233] pt-8">
          The airframe is the body. ARGUS is the brain. The advantage is in the system that connects them.
        </p>

      </div>
    </section>
  )
}
