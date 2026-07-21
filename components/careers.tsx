const roles = [
  'AUTONOMY',
  'PERCEPTION',
  'EMBEDDED',
  'AERODYNAMICS',
  'ML SYSTEMS',
  'OSINT',
  'COMMS SECURITY',
  'MISSION OPS',
  'HARDWARE-IN-THE-LOOP',
  'MANUFACTURING',
]

const jobPostingSchema = {
  '@context': 'https://schema.org',
  '@graph': roles.map((role) => ({
    '@type': 'JobPosting',
    title: `${role} Engineer — Rudraas Dynamics`,
    datePosted: '2026-01-01',
    validThrough: '2026-12-31',
    description: `Open position at Rudraas Dynamics for ${role} specialists. We build sovereign intelligence software, autonomous aerial platforms, and counter-UAS systems. Send relevant work, not a conventional resume.`,
    employmentType: 'FULL_TIME',
    industry: 'Defence Technology',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Rudraas Dynamics',
      sameAs: 'https://rudraas.com',
      logo: 'https://rudraas.com/images/rudraas-emblem.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        addressRegion: 'Delhi',
        addressCountry: 'IN',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'India',
    },
  })),
}

export function Careers() {
  return (
    <section id="careers" className="relative py-32 bg-[#050912]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block rd-enter-1">
          // 005 — RECRUITING
        </span>

        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-4xl lg:text-5xl font-medium text-[#F2EFE6] mb-8 max-w-4xl leading-tight rd-enter-2">
          We are hiring defence engineers,<br />operators, and intelligence specialists.
        </h2>

        <p className="text-2xl md:text-3xl font-light text-[#D5D6D8] mb-8 max-w-2xl rd-enter-3">
          The noise we make is in the work.
        </p>

        <div className="max-w-3xl space-y-6 mb-12 rd-enter-4">
          <p className="text-[#D5D6D8] font-light leading-relaxed">
            If you have shipped a flight controller, perception stack, electronic warfare package, OSINT pipeline, secure communications system, or mission-critical autonomy software — and you want to build in a sovereign defence context — speak to us.
          </p>
          <p className="text-[#D5D6D8] font-light leading-relaxed">
            We build inside the problem. Requirements come from operators and mission realities, not from a roadmap written in isolation.
          </p>
          <p className="text-[#D5D6D8] font-light leading-relaxed">
            We do not need a conventional resume first. Send relevant work: systems, papers, repositories, prototypes, field experience, or prior deployment history.
          </p>
        </div>

        {/* Roles Tags */}
        <div className="flex flex-wrap gap-3 mb-12">
          {roles.map((role) => (
            <span
              key={role}
              className="px-4 py-2 border border-[#2a3344] text-[#D5D6D8] font-mono text-xs tracking-wider hover:border-[#D5D6D8] transition-colors cursor-default"
            >
              {role}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-6">
          <a
            href="/career"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#F2EFE6] text-[#050912] text-sm tracking-widest uppercase font-medium hover:bg-[#D5D6D8] transition-colors duration-200"
          >
            SUBMIT WORK
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="/career"
            className="group inline-flex items-center gap-2 text-[#D5D6D8] text-sm tracking-widest uppercase font-medium hover:text-[#F2EFE6] transition-colors duration-200"
          >
            View Open Positions
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
