export function Sovereign() {
  const stats = [
    { label: 'TEAM', value: '100% Indian' },
    { label: 'ORIGIN', value: 'New Delhi' },
    { label: 'JURISDICTION', value: 'DDP · iDEX-aligned' },
    { label: 'IP REGISTER', value: 'Wholly owned' },
  ]

  return (
    <section id="sovereign" className="relative py-32 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
          // 003 — SOVEREIGN
        </span>
        
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 max-w-4xl leading-tight">
          Indian by construction.<br />Allied-grade by design.
        </h2>

        <p className="text-2xl md:text-3xl font-light text-[#D5D6D8] mb-12 max-w-2xl">
          Owned by India.<br />
          Engineered to lead the world.
        </p>

        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          <div className="space-y-6">
            <p className="text-[#D5D6D8] font-light leading-relaxed">
              Rudraas is an independent Indian defence-technology company. We design and build the software in-house. We design and build the hardware in-house. We engineer the electronics — boards, firmware, flight controllers — in-house.
            </p>
            <p className="text-[#D5D6D8] font-light leading-relaxed">
              We partner globally for the small set of things we choose not to build today. We do not partner on the things that define sovereignty: the brain, the IP, the data, the supply chain that has to keep working in the worst week of a bad year.
            </p>
            <p className="text-[#D5D6D8] font-light leading-relaxed">
              <strong className="text-[#F2EFE6]">Cap table, IP register, supply chain, and operating jurisdiction</strong> — all four are Indian. The architecture of the company is the same architecture as the platform: hardened from first principles.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-[#2a3344] pl-6">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#6A6E78] uppercase mb-2 block">
                  // {stat.label}
                </span>
                <span className="text-lg md:text-xl text-[#F2EFE6] font-medium">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
