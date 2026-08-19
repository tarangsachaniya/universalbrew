import { Coffee } from "lucide-react"

type SectionHeadingProps = {
  title: string
  description?: string
  align?: "center" | "left"
}

export function SectionHeading({
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const isCenter = align === "center"

  return (
    <div className={isCenter ? "text-center" : ""}>
      <h2 className="text-3xl md:text-4xl font-serif mb-4 text-primary">
        {title}
      </h2>
      <div className={`flex items-center gap-2 mb-6 ${isCenter ? "justify-center" : ""}`}>
        <div className="h-px w-12 bg-primary/30" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Coffee key={i} className="h-3 w-3 text-primary" />
          ))}
        </div>
        <div className="h-px w-12 bg-primary/30" />
      </div>
      {description && (
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
