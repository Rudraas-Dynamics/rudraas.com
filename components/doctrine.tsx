const buildPrinciples = [
  {
    number: '01',
    title: 'Embedded in the problem',
    description:
      'Requirements come from operators, field conditions, and mission realities — not from a roadmap written in isolation.',
  },
  {
    number: '02',
    title: 'Vertically integrated',
    description:
      'Software, electronics, platforms, and integration logic are developed together, so the system can evolve across layers instead of depending on isolated vendors.',
  },
  {
    number: '03',
    title: 'Continuously learning',
    description:
      'The system is designed to improve through testing, feedback, data, and operational lessons — not through static specifications alone.',
  },
]

export function Doctrine() {
  return (
    <section id="doctrine" className="relative py-32 bg-[#050912]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
          // 001 — MISSION
        </span>

        {/* Headline */}
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 max-w-4xl leading-tight rd-enter-2">
          Modern conflict is decided by the systems that sense, decide, and act fastest.
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl font-normal text-[#D5D6D8] mb-16 max-w-3xl leading-relaxed rd-enter-3">
          Rudraas Dynamics exists to build sovereign autonomy for Indian defence requirements — combining perception, mission software, uncrewed systems, and counter-UAS capability into one integrated stack.
        </p>

        {/* Main body */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 rd-enter-4">
          <div className="space-y-6">
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              Modern defence is no longer defined by platforms alone. Advantage increasingly comes from the speed and quality of the loop: sensing the environment, fusing information, supporting decisions, and acting through systems that can operate under pressure.
            </p>
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              India cannot depend on black-box autonomy or fragile external supply chains for that loop. The intelligence layer, integration logic, data model, and mission software must be controlled, adapted, and improved domestically.
            </p>
            <p className="text-[#D5D6D8] font-normal leading-relaxed">
              Rudraas is building for that requirement: AI-native defence systems where software, electronics, platforms, and field realities are engineered together.
            </p>
          </div>

          {/* Autonomy Thesis */}
          <div className="space-y-6">
            <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">
              // THE AUTONOMY THESIS
            </span>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-medium text-[#F2EFE6] leading-snug">
              Computer vision is the wedge.<br />Autonomy is the arc.
            </h3>
            <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
              The first problem is perception: enabling machines to see, classify, and understand real environments from moving platforms and distributed sensors.
            </p>
            <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
              Once perception works at the edge, the next layers follow: decision support, autonomous navigation, coordinated platform behaviour, and mission-system integration.
            </p>
            <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
              Autonomy does not replace the operator. It increases speed, awareness, and system reliability while preserving human authority at critical decision points.
            </p>
          </div>
        </div>

        {/* How We Build */}
        <div className="mb-24">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // HOW WE BUILD
          </span>
          <div className="grid md:grid-cols-3 gap-x-16 gap-y-0">
            {buildPrinciples.map((principle) => (
              <div key={principle.number} className="pt-8 border-t border-[#1a2233] hover:border-[#4a5566] transition-colors duration-200">
                <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] mb-4 block">
                  {principle.number}
                </span>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-[#F2EFE6] mb-4">
                  {principle.title}
                </h3>
                <p className="text-[#D5D6D8] font-normal text-sm leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border-t border-[#1a2233] pt-16">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-6 block">
            // OUR MISSION
          </span>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl lg:text-3xl font-medium text-[#F2EFE6] max-w-4xl leading-snug">
            To build India-controlled autonomous defence systems that can sense, decide, and act across contested environments — allied-ready by design, adaptable to Indian requirements, and governed by responsible human authority.
          </p>
        </div>

      </div>
    </section>
  )
}
