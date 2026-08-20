import Image from "next/image"
import { Coffee, Leaf, Droplet, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react"
import { getWebPUrl } from "@/lib/cloudinary-url"
import { DEFAULT_ABOUT_TITLE, DEFAULT_ABOUT_BODY, DEFAULT_ABOUT_FEATURES } from "@/lib/about"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story - Universal Brew",
  description: "Learn about Universal Brew Coffee — our story, values, and our commitment to premium quality.",
  alternates: { canonical: "https://www.universalbrew.shop/about-us" },
}

export default function AboutUsPage() {
  const heroImg = getWebPUrl("/images/img2.webp", 1920)

  // Map features to icons
  const iconMap = [
    <Leaf key={0} className="w-5 h-5" />,
    <Sparkles key={1} className="w-5 h-5" />,
    <Droplet key={2} className="w-5 h-5" />,
    <ShieldCheck key={3} className="w-5 h-5" />,
    <Coffee key={4} className="w-5 h-5" />,
    <CheckCircle2 key={5} className="w-5 h-5" />
  ]

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#0a0400]">
          <Image
            src={heroImg}
            alt="Coffee beans background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 mt-20">
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-amber-500 font-semibold mb-4">
            · The Universal Brew Story ·
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 font-normal tracking-tight leading-tight">
            Crafting the Perfect Cup,<br />Every Single Time.
          </h1>
        </div>
      </section>

      {/* ── Origin Story ────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 md:sticky md:top-32">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Our Origin
            </h2>
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
          </div>
          
          <div className="md:col-span-7 space-y-8">
            <h3 className="text-xl md:text-2xl text-foreground/90 font-medium leading-snug">
              {DEFAULT_ABOUT_TITLE}
            </h3>
            
            <div className="text-muted-foreground leading-relaxed space-y-6 text-[1.05rem]">
              {DEFAULT_ABOUT_BODY.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────── */}
      <section className="py-24 bg-card/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-amber-500 font-semibold mb-3">
              · Our Promise ·
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              What Makes Us Different
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {DEFAULT_ABOUT_FEATURES.map((feature, i) => (
              <div key={i} className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 transform group-hover:-translate-y-1">
                  {iconMap[i % iconMap.length]}
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
