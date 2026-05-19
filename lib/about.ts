export type AboutFeature = {
  title: string
  description: string
}

export const DEFAULT_ABOUT_TITLE = 'An original, pure, rich-creamy & aromatic coffee with incredible taste'

export const DEFAULT_ABOUT_BODY = `Coffee could be a daily need or a luxury. A book, rain, and a cup of coffee - nothing is as pleasurable as this combo. Start your day with Universal Brew.

A fully owned venture by Khyati & Sons, we at Universal Brew, know what every coffee loving loyalist seeks for in their brew. Be it your daily requirement or an occasional nudge to get through an active day.`

export const DEFAULT_ABOUT_FEATURES: AboutFeature[] = [
  {
    title: 'No Artificial Flavours',
    description: 'Our coffee is made without any synthetic flavors, colors, or preservatives.',
  },
  {
    title: 'Keto Friendly',
    description: 'This coffee is keto-friendly and fits naturally into a low-carb lifestyle.',
  },
  {
    title: 'No Added Sugar',
    description: 'No additional sugar is added to this coffee.',
  },
  {
    title: 'Gluten-Free',
    description: 'We provide 100% gluten-free coffee.',
  },
  {
    title: 'No Machines Required',
    description: 'Anyone can make it anywhere, at home or the office, without a machine.',
  },
  {
    title: '100% Pure Coffee',
    description: 'This is 100% pure premium Arabica coffee without chicory or other blends.',
  },
]

export function parseAboutFeatures(raw: unknown): AboutFeature[] {
  if (!Array.isArray(raw)) return DEFAULT_ABOUT_FEATURES

  const features = raw
    .filter(
      (item): item is AboutFeature =>
        typeof item === 'object' &&
        item !== null &&
        'title' in item &&
        'description' in item &&
        typeof item.title === 'string' &&
        typeof item.description === 'string'
    )
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.title.length > 0 && item.description.length > 0)

  return features.length > 0 ? features : DEFAULT_ABOUT_FEATURES
}
