"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Coffee, MapPin, Phone, Mail } from "lucide-react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Sample taster form submitted:", formData)
    alert("Thank you! We will send you a sample taster soon.")
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  return (
    <section id="contact" className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Sample Taster Form */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Sample Taster
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-primary-foreground/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Coffee key={i} className="h-3 w-3 text-primary-foreground/70" />
                ))}
              </div>
              <div className="h-px w-12 bg-primary-foreground/30" />
            </div>
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
                className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary"
              >
                SUBMIT
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Connect Us
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-primary-foreground/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Coffee key={i} className="h-3 w-3 text-primary-foreground/70" />
                ))}
              </div>
              <div className="h-px w-12 bg-primary-foreground/30" />
            </div>

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
