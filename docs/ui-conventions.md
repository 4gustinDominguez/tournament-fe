# UI Conventions

Conventions for spacing, responsive behavior, and visual tokens across the application.

## Spacing

Always use multiples of 4. Available scale:

| Token | px |
| ----- | -- |
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 7 | 28 |
| 8 | 32 |
| 10 | 40 |
| 12 | 48 |
| 16 | 64 |
| 20 | 80 |
| 24 | 96 |
| 32 | 128 |

Do not use values like 10px, 14px, 18px, 22px, etc. Prefer spacing tokens over arbitrary values.

## Border radius

| Token | px |
| ----- | -- |
| sm | 8 |
| md | 12 |
| lg | 16 |
| xl | 20 |
| 2xl | 24 |
| 3xl | 28 |

Use `rounded-3xl` for section cards, `rounded-2xl` for cards, `rounded-xl` for badges/alerts, `rounded-lg` for inputs/buttons.

## Palette

Only use: `brand`, `amber`, `night`, `neutral`.

Do not use `emerald`, `sky`, `gray`, `slate`, `zinc`, `stone`, or any raw color values for backgrounds/text/borders.

## Layout patterns

### Vertical rhythm

Default section stacking: `space-y-8`.

### Card padding

- Main content cards: `p-6`
- Compact list items: `p-4`
- Header rows inside cards: `px-6 py-4`

### Page header

Standard pattern:
```
flex flex-col md:flex-row md:items-center justify-between gap-4
```

Title: `display-title text-3xl md:text-4xl`.

### Containers

All page containers: `container mx-auto px-4`.

Header/footer/nav mobile: `px-4` (aligns with page containers).

### Flow pages

Settings, wizard, match detail, referee match:
```
max-w-2xl mx-auto space-y-8
```

## Landing pages

### Hero sections

All heroes:
```
pt-20 pb-24 md:pt-28 md:pb-32
```

### Content sections

All non-hero content sections:
```
py-16 md:py-20
```

### Section cards

```
p-8 md:p-10
```

Inner header spacing: `mb-8`.

## Responsive

- Buttons: `flex-col sm:flex-row` for action groups.
- Team names / long text: `min-w-0 truncate` in flex containers.
- Date + badge / score rows: `flex-wrap` when items may overflow.
- Forms: `grid-cols-1 sm:grid-cols-2` for date/number fields.
- Page headers: `flex-col md:flex-row` with `gap-4`.
- Stats grids on mobile: `gap-8 md:gap-10`.
