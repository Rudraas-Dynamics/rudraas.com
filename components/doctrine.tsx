export function Doctrine() {
  const principles = [
    {
      number: '01',
      label: 'Thesis',
      title: 'Software compounds.',
      description: 'Hardware commoditises across cycles. The defensible layer is the operating brain — perception, autonomy, mission planning, command. We compound there first; the airframes follow.'
    },
    {
      number: '02',
      label: 'Posture',
      title: 'Inside the customer\'s problem.',
      description: 'We are not outside selling in. We embed with the force, learn the doctrine, and co-develop the capability. We earn the seat by being inside the wire.'
    },
    {
      number: '03',
      label: 'Sovereign',
      title: 'Owned by India by construction.',
      description: 'Indian-incorporated. Indian-built. Indian-controlled supply, IP, and data path. Sovereignty is not a clause in a contract; it is encoded into the topology of the company.'
    },
    {
      number: '04',
      label: 'Theatre',
      title: 'Built for the Indo-Pacific. Ready for the allied world.',
      description: 'The home theatre is the hard problem; if we are credible there, we are credible everywhere. United States, Gulf, broader Asia follow the curve we have already shipped against.'
    }
  ]

  return (
    <section id="doctrine" className="relative py-32 bg-[#050912]">
      {/* Section Label */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
          // 002 — DOCTRINE
        </span>
        
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-20 max-w-4xl leading-tight">
          We do not build a product.<br />We build a posture.
        </h2>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
          {principles.map((principle) => (
            <div key={principle.number} className="group">
              <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] mb-4 block">
                {principle.number} — {principle.label}
              </span>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-2xl font-medium text-[#F2EFE6] mb-4">
                {principle.title}
              </h3>
              <p className="text-[#D5D6D8] font-light leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
