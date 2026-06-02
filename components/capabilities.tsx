'use client'

import { useEffect, useRef, useState } from 'react'

const capabilities = [
  {
    id: 'os',
    number: '01',
    label: 'OS',
    title: 'AI & autonomy',
    tag: 'SOFTWARE · THE BRAIN',
    description: 'Perception, planning, and decision layers built for the contested theatre. On-edge inference. Mission graphs that survive denied environments and degraded comms.',
  },
  {
    id: 'sensing',
    number: '02',
    label: 'Sensing',
    title: 'Sensing & awareness',
    tag: 'SENSING · THE FABRIC',
    description: 'Multi-modal fusion across optical, RF, and inertial. Sovereign signal path from emitter to operator. The fabric over which decisions are made.',
  },
  {
    id: 'platforms',
    number: '03',
    label: 'Platforms',
    title: 'Autonomous platforms',
    tag: 'HARDWARE · THE REACH',
    description: 'Unmanned systems designed and built in-house — airframe to flight controller. Vertically integrated electronics. Engineered for endurance, not the demo.',
  },
  {
    id: 'effect',
    number: '04',
    label: 'Effect',
    title: 'Effectors & counter-UAS',
    tag: 'EFFECT · THE EDGE',
    description: 'Layered hard-kill and soft-kill. Kinetic, electromagnetic, and informational effects under a single command layer. The last layer of the kill chain.',
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
      { threshold: 0.2 }
    )

    const items = sectionRef.current?.querySelectorAll('[data-id]')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="capability" ref={sectionRef} className="relative py-32 bg-[#050912]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-20">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
            // 004 — CAPABILITY
          </span>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] max-w-4xl leading-tight">
            Four surfaces. One brain.<br />One supply chain.
          </h2>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {capabilities.map((capability, index) => (
            <article
              key={capability.id}
              data-id={capability.id}
              className={`group relative p-8 md:p-10 bg-[#0a0f1a] border border-[#1a2233] hover:border-[#2a3344] transition-all duration-500 ${
                visibleItems.includes(capability.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Number and Label */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78]">
                  {capability.number} / {capability.label}
                </span>
              </div>

              {/* Icon placeholder */}
              <div className="w-12 h-12 mb-6 flex items-center justify-center">
                <svg aria-hidden="true" className="w-10 h-10 text-[#D5D6D8]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
                  <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" />
                  <line x1="24" y1="4" x2="24" y2="44" />
                  <line x1="4" y1="14" x2="44" y2="34" />
                  <line x1="44" y1="14" x2="4" y2="34" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-medium text-[#F2EFE6] mb-4">
                {capability.title}
              </h3>

              {/* Description */}
              <p className="text-[#D5D6D8] font-light leading-relaxed mb-6">
                {capability.description}
              </p>

              {/* Tag */}
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase">
                {capability.tag}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
