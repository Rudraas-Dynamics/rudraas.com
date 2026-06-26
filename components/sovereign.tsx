const stats = [
  { label: 'BASE', value: 'Delhi NCR, India' },
  { label: 'ARCHITECTURE', value: 'Sovereign control plane' },
  { label: 'INTEGRATION', value: 'Platform-agnostic · sensor-agnostic' },
  { label: 'SYSTEM MODEL', value: 'Software · electronics · platforms · mission integration' },
  { label: 'POSTURE', value: 'Indian requirements · allied-ready by design' },
]

const integrationCards = [
  {
    number: '01',
    title: 'Platform-agnostic',
    description:
      'Built to integrate across existing and future uncrewed systems, not locked to a single airframe or vendor ecosystem.',
  },
  {
    number: '02',
    title: 'Sensor-agnostic',
    description:
      'Designed to fuse feeds from optical, RF, telemetry, open-source, and mission-specific sensing layers.',
  },
  {
    number: '03',
    title: 'Payload-adaptable',
    description:
      'Structured for mission payloads to evolve without forcing a full redesign of the control or intelligence layer.',
  },
  {
    number: '04',
    title: 'Operator-in-the-loop',
    description:
      'Autonomy supports speed, perception, and decision quality while preserving human authority at critical gates.',
  },
]

const sovereigntyBlocks = [
  {
    title: 'Control',
    description:
      'Ownership of the software, data model, integration logic, and system architecture.',
  },
  {
    title: 'Adaptability',
    description:
      'The ability to modify systems for terrain, doctrine, payloads, and operational constraints.',
  },
  {
    title: 'Continuity',
    description:
      'Reduced dependency on fragile foreign supply chains for the layers that define mission capability.',
  },
]

export function Sovereign() {
  return (
    <section id="sovereign" className="relative py-32 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
          // 002 — SOVEREIGN
        </span>

        {/* Headline */}
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 max-w-4xl leading-tight rd-enter-2">
          Sovereign by construction.<br />Allied-ready by design.
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl font-normal text-[#D5D6D8] mb-16 max-w-3xl leading-relaxed rd-enter-3">
          Rudraas builds the intelligence layer, electronics, integration logic, and uncrewed systems architecture needed for Indian defence requirements — with modular pathways for allied-ready integration.
        </p>

        {/* Body + stats */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 rd-enter-4">
          <div className="space-y-6">
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              Sovereignty is not a slogan. It is control over the layers that matter: architecture, software, data, electronics, integration, and the ability to adapt systems without waiting on a foreign black box.
            </p>
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              Rudraas is built around a sovereign control plane: a software-first architecture that can integrate across sensors, payloads, platforms, and mission systems while preserving Indian control over the core intelligence and decision-support layer.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-[#2a3344] pl-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-1 block">
                  {stat.label}
                </span>
                <span className="text-sm md:text-base text-[#F2EFE6] font-medium leading-snug">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Philosophy */}
        <div className="mb-24">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // INTEGRATION PHILOSOPHY
          </span>
          <div className="grid md:grid-cols-2 gap-6">
            {integrationCards.map((card) => (
              <div
                key={card.number}
                className="p-8 bg-[#050912] border border-[#1a2233] hover:border-[#4a5566] hover:bg-[#0a0f1a] hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] mb-4 block">
                  {card.number}
                </span>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-[#F2EFE6] mb-3">
                  {card.title}
                </h3>
                <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What Sovereignty Means */}
        <div>
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // WHAT SOVEREIGNTY MEANS
          </span>
          <div className="grid md:grid-cols-3 gap-8">
            {sovereigntyBlocks.map((block) => (
              <div key={block.title} className="pt-8 border-t border-[#1a2233] hover:border-[#4a5566] transition-colors duration-200">
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-[#F2EFE6] mb-4">
                  {block.title}
                </h3>
                <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
