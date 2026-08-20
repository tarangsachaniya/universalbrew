import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  title: string
  description?: string
  align?: "center" | "left"
  variant?: "default" | "inverted"
  className?: string
  headingClassName?: string
  dividerClassName?: string
  descriptionClassName?: string
}

export function SectionHeading({
  title,
  description,
  align = "center",
  variant = "default",
  className,
  headingClassName,
  dividerClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  const isCenter = align === "center"

  // Color scheme based on variant
  const isDark = variant === "inverted"
  const titleColor = isDark ? "text-primary-foreground" : "text-primary"
  const dividerLineColor = isDark ? "bg-primary-foreground/30" : "bg-primary/30"
  const dividerIconColor = isDark ? "text-primary-foreground/70" : "text-primary"
  const descriptionColor = isDark
    ? "text-primary-foreground/80"
    : "text-muted-foreground"

  return (
    <div className={cn(isCenter ? "text-center" : "", className)}>
      <h2
        className={cn(
          "text-3xl md:text-4xl font-serif mb-4",
          titleColor,
          headingClassName
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "flex items-center gap-2 mb-6",
          isCenter ? "justify-center" : "",
          dividerClassName
        )}
      >
        <div className={`h-px w-12 ${dividerLineColor}`} />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Coffee key={i} className={`h-3 w-3 ${dividerIconColor}`} />
          ))}
        </div>
        <div className={`h-px w-12 ${dividerLineColor}`} />
      </div>
      {description && (
        <p
          className={cn(
            "leading-relaxed",
            descriptionColor,
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
