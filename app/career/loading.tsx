import { Header } from '@/components/header'
import { Footer } from '@/components/contact'
import { Skeleton } from '@/components/ui/skeleton'

export default function CareerLoading() {
  return (
    <main className="bg-[#050912] min-h-screen">
      <Header />

      <section className="relative pt-40 pb-16 bg-[#050912]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="font-mono text-xs tracking-[0.2em] text-[#6A6E78] uppercase mb-8 block">
            // 001 — OPEN POSITIONS
          </span>
          <Skeleton className="h-10 md:h-14 w-full max-w-2xl mb-6 bg-[#1a2233]" />
          <Skeleton className="h-5 w-64 bg-[#1a2233]" />
        </div>
      </section>

      <section className="relative py-16 bg-[#050912]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <Skeleton className="h-40 w-full mb-12 bg-[#1a2233]" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="border border-[#2a3344] p-6 flex flex-col gap-4">
                <Skeleton className="h-5 w-3/4 bg-[#1a2233]" />
                <Skeleton className="h-3 w-1/3 bg-[#1a2233]" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 bg-[#1a2233]" />
                  <Skeleton className="h-5 w-16 bg-[#1a2233]" />
                  <Skeleton className="h-5 w-16 bg-[#1a2233]" />
                </div>
                <Skeleton className="h-8 w-full bg-[#1a2233]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
