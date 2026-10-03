export const artCategories = [
  { slug: "watercolour", label: "Watercolour" },
  { slug: "oil", label: "Oil" },
  { slug: "acrylic", label: "Acrylic" },
  { slug: "sculpture", label: "Sculpture" },
  { slug: "prints", label: "Prints" },
  { slug: "other", label: "Other" },
] as const;

export type ArtCategory = (typeof artCategories)[number];
