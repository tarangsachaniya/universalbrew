"use client"

import { useState } from "react"
import { ArrowRight, Loader2, MapPin, Phone, Mail } from "lucide-react"
import { toast } from "sonner"

export function NewsletterSignup() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/sample-taster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(typeof data?.error === "string" ? data.error : "Please check your details and try again.")
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem 1rem",
    fontSize: "0.875rem",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.9)",
    outline: "none",
    borderRadius: 0,
    transition: "border-color 0.2s ease",
  }

  return (
    <section id="contact" style={{ background: "var(--coffee-dark, #3b2a20)", color: "#fff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
          className="contact-grid"
        >
          {/* ── Sample Taster form ────────────────────────────── */}
          <div style={{ padding: "5rem 4rem 5rem 2rem", borderRight: "1px solid rgba(255,255,255,0.08)" }}
            className="form-col">
            <p style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(251,191,36,0.75)", fontWeight: 600, marginBottom: "1rem" }}>
              · Free Sample
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2rem, 3vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}>
              Try Before You Buy
            </h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
              Request a free sample taster and have our coffee delivered to your doorstep.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={inputStyle}
                />
                <input
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                  padding: "0.9rem 2rem",
                  fontSize: "0.62rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  background: "rgba(251,191,36,0.92)",
                  color: "#1a0800",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  alignSelf: "flex-start",
                  transition: "background 0.2s ease",
                }}
              >
                {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {loading ? "Sending…" : "Request Sample"}
                {!loading && <ArrowRight size={13} />}
              </button>
            </form>
          </div>

          {/* ── Contact info ──────────────────────────────────── */}
          <div style={{ padding: "5rem 2rem 5rem 4rem" }} className="contact-col">
            <p style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(251,191,36,0.75)", fontWeight: 600, marginBottom: "1rem" }}>
              · Find Us
            </p>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2rem, 3vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "2.5rem",
            }}>
              Get In Touch
            </h2>

            {[
              {
                label: "Office",
                icon: <MapPin size={14} style={{ flexShrink: 0, marginTop: "2px", opacity: 0.6 }} />,
                content: "504, Shypath-2, Above Gordhan Thal,\nS.G Road, Ahmedabad - 380054",
              },
              {
                label: "Warehouse",
                icon: <MapPin size={14} style={{ flexShrink: 0, marginTop: "2px", opacity: 0.6 }} />,
                content: "32-33 Vidhi Estate, Nr. Bombay Conductor,\nVatva GIDC, Ahmedabad - 382445",
              },
            ].map(({ label, icon, content }) => (
              <div key={label} style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.6rem", fontWeight: 600 }}>
                  {label}
                </p>
                <div style={{ display: "flex", gap: "0.65rem", color: "rgba(255,255,255,0.65)" }}>
                  {icon}
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.65, whiteSpace: "pre-line" }}>{content}</p>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <a href="mailto:gunjan@universalbrew.com"
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }}>
                <Mail size={14} style={{ opacity: 0.6 }} />
                gunjan@universalbrew.com
              </a>
              <a href="tel:+919825089833"
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }}>
                <Phone size={14} style={{ opacity: 0.6 }} />
                +91 9825089833
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .form-col { padding: 3.5rem 1.25rem !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .contact-col { padding: 3rem 1.25rem !important; }
        }
      `}</style>
    </section>
  )
}
