"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Variant = {
  id: string
  weight: string
}

type VariantSelectorProps = {
  variants: Variant[]
  value: string | null
  onChange: (id: string) => void
  className?: string
}

export function VariantSelector({ variants, value, onChange, className }: VariantSelectorProps) {
  // Nothing to choose between when there is one (or zero) variant.
  if (variants.length <= 1) return null

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Weight
      </span>
      <ToggleGroup
        type="single"
        value={value ?? undefined}
        // Radix fires with "" when the active item is clicked again; ignore that so
        // exactly one variant stays selected at all times.
        onValueChange={(v) => {
          if (v) onChange(v)
        }}
        variant="outline"
        size="lg"
        aria-label="Select weight"
      >
        {variants.map((v) => (
          <ToggleGroupItem key={v.id} value={v.id} aria-label={v.weight} className="px-5">
            {v.weight}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
