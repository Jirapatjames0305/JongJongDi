// The durian product is served by its own Wattana Garden storefront app,
// not by the internal /products/[slug] page.
export const DURIAN_SLUG = "durian-chips-premium";
export const WATTANA_URL =
  process.env.NEXT_PUBLIC_WATTANA_URL ?? "https://wattana-garden.jongjongdi.com";

// Redirect the durian product's internal link to its external storefront.
// Any other product link passes through unchanged.
export function resolveProductLink(link: string): string {
  return link === `/products/${DURIAN_SLUG}` ? WATTANA_URL : link;
}
