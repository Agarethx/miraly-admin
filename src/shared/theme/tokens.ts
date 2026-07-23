/**
 * Design tokens (TypeScript mirror of the CSS variables in index.css).
 *
 * Colors live ONLY as CSS variables (consumed via Tailwind semantic classes like
 * `bg-background`, `text-muted-foreground`). These TS tokens cover the non-color
 * scales so spacing/radius/typography are referenced by name, never magic numbers.
 */
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const;

export const radius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  full: '9999px',
} as const;

export const typography = {
  pageTitle: 'text-xl font-semibold tracking-tight',
  sectionTitle: 'text-base font-medium',
  body: 'text-sm',
  caption: 'text-xs text-muted-foreground',
  mono: 'font-mono text-xs',
} as const;

export const shadows = {
  subtle: 'shadow-subtle',
  card: 'shadow-card',
  popover: 'shadow-popover',
} as const;

export const motion = {
  fadeIn: 'animate-fade-in',
} as const;
