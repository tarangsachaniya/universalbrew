"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionHeading } from "@/components/section-heading"
import { MapPin, Phone, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NewsletterSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/sample-taster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Please check your details and try again."
        toast.error(message)
        return
      }

      toast.success("Thanks! We'll send your sample taster soon.")
      setFormData({ name: "", email: "", phone: "", address: "" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Sample Taster Form */}
          <div>
            <SectionHeading title="Sample Taster" align="left" variant="inverted" />
            <p className="text-primary-foreground/80 mb-8">
              Provide your details and have our coffee samples at your doorstep.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
                  required
                />
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={loading}
                className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "SUBMITTING…" : "SUBMIT"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <SectionHeading title="Connect Us" align="left" variant="inverted" />

            {/* Office */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary-foreground/90 mb-4">OUR OFFICE</h3>
              <div className="space-y-3 text-primary-foreground/80">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    504, Shypath-2, Above Gordhan Thal,<br />
                    S.G Road, Ahmedabad - 380054
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0" />
                  <a href="mailto:gunjan@universalbrew.com" className="text-sm hover:underline">
                    gunjan@universalbrew.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:+919825089833" className="text-sm hover:underline">
                    +91 9825089833
                  </a>
                </div>
              </div>
            </div>

            {/* Warehouse */}
            <div>
              <h3 className="text-lg font-semibold text-primary-foreground/90 mb-4">OUR WAREHOUSE</h3>
              <div className="space-y-3 text-primary-foreground/80">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    32-33 Vidhi Estate,<br />
                    Nr. Bombay Conductor,<br />
                    Vatva GIDC, Vatva Ahmedabad - 382445
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0" />
                  <a href="mailto:gunjan@universalbrew.com" className="text-sm hover:underline">
                    gunjan@universalbrew.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0" />
                  <a href="tel:+919825089833" className="text-sm hover:underline">
                    +91 9825089833
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
