# 3D Printing Gallery Maintenance Guide

This guide explains how to replace the placeholder 3D printing gallery entries with real projects.

The gallery is currently static-site friendly. There is no backend, upload form, database, authentication, payment flow, request queue, or owner dashboard in this repository.

## Where the gallery data lives

The gallery entries are currently stored in a JavaScript array, not a separate JSON file:

```text
rsc/js/print-gallery.js
```

Look for:

```js
const printGalleryItems = [
  {
    id: 'manual-swap-token-sample',
    title: 'Manual Color-Swap Game Token',
    // ...
  }
];
```

Each object inside `printGalleryItems` becomes one gallery card.

## Where images should go

Put real print photos here:

```text
assets/images/prints/
```

Use compressed web-friendly images when possible. Good choices:

- `.jpg` for normal photos
- `.webp` for smaller modern images
- `.png` only when transparency or crisp UI-like graphics matter
- `.svg` only for illustrations or placeholders

Example:

```text
assets/images/prints/commander-lid-with-text.jpg
```

Then reference it from the matching gallery entry:

```js
image: 'assets/images/prints/commander-lid-with-text.jpg'
```

## Recommended workflow for replacing a placeholder

1. Add the real photo to `assets/images/prints/`.
2. Open `rsc/js/print-gallery.js`.
3. Find the placeholder object you want to replace.
4. Replace the placeholder values with real project information.
5. Keep the field names the same.
6. Make sure the `image` path points to the real image.
7. Make sure the `alt` text describes the visible print.
8. Add the correct filter keys so search/filter/pagination keep working.
9. Preview the page locally or through GitHub Pages.

## Entry template

Copy this object into `printGalleryItems` when adding a new print:

```js
{
  id: 'unique-project-slug',
  title: 'Project Title',
  description: 'Short summary of what the print is and why it matters.',
  categories: ['Functional', 'Repair / Utility'],
  sourceType: 'designed',
  material: 'PLA',
  colors: ['Black'],
  nozzle: '0.4mm',
  layerHeight: '0.2mm',
  modelOrigin: 'Designed by me',
  tags: ['functional', 'repair', 'PLA'],
  image: 'assets/images/prints/example-photo.jpg',
  alt: 'Short description of the visible 3D print photo',
  link: '',
  notes: 'What I learned, tuned, repaired, changed, or debugged during this print.',
  filters: ['designed-by-me', 'functional', 'repair-utility']
}
```

## Field reference

| Field | Purpose |
| --- | --- |
| `id` | Unique slug for the card. Use lowercase letters, numbers, and hyphens. |
| `title` | Card title shown to visitors. |
| `description` | Short explanation of the print. |
| `categories` | Human-readable category chips shown on the card. |
| `sourceType` | Controls the attribution badge. Use `designed`, `remixed`, or `printed`. |
| `material` | Filament/material used, such as `PLA`, `PETG`, `TPU`, or `wood PLA`. |
| `colors` | Array of filament colors used. |
| `nozzle` | Nozzle size, such as `0.4mm` or `0.2mm`. |
| `layerHeight` | Layer height, such as `0.2mm` or `0.1mm`. |
| `modelOrigin` | Where the model came from or how it was created. |
| `tags` | Searchable keywords. These are also displayed on the card. |
| `image` | Relative path to the project image. |
| `alt` | Accessible image description. Do not leave this blank. |
| `link` | Optional external model/source/writeup link. Leave as `''` when unused. |
| `notes` | What was learned, tuned, fixed, or customized. |
| `filters` | Machine-readable filter keys used by the filter buttons. |

## Source type options

Use one of these values for `sourceType`:

```js
sourceType: 'designed'
```

Shows: `Designed by me`

```js
sourceType: 'remixed'
```

Shows: `Remixed/customized by me`

```js
sourceType: 'printed'
```

Shows: `Printed by me / model by another maker`

## Filter keys

Use any matching values from this list:

```js
filters: [
  'designed-by-me',
  'printed-by-me',
  'functional',
  'decorative',
  'tokens-cards',
  'repair-utility',
  'manual-filament-swap',
  'experimental'
]
```

The gallery is one reactive gallery. There is not a separate secondary gallery for other projects. Search, filters, and pagination all operate on the same `printGalleryItems` array.

## Pagination behavior

Pagination is automatic.

The current page size is controlled in `rsc/js/print-gallery.js`:

```js
const PRINT_PAGE_SIZE = 6;
```

When the number of matching entries is greater than the page size, the Previous and Next buttons move through the matching results. Search and filter changes reset the gallery back to page 1.

To show more or fewer cards per page, change `PRINT_PAGE_SIZE`.

## Suggested real entries to add first

Good first real entries would be:

1. A manual filament-swap print.
2. A functional repair or utility part.
3. A print that failed once and improved after settings changes.
4. A model you designed or measured yourself.
5. A decorative/public model where you can clearly credit the source.

## Quality checklist before publishing a real entry

Before replacing a placeholder, make sure the entry answers these questions:

- Is the image real and reasonably clear?
- Does `modelOrigin` honestly explain whether the model was designed, remixed, or simply printed?
- Does the entry avoid implying you designed someone else's model?
- Are material, nozzle, and layer height filled in?
- Does `notes` explain the technical value, not just that the print exists?
- Do the filters match the content?
- Does the alt text describe the image for screen readers?

## Future improvement: move data to JSON

If the gallery gets large, move the data out of `rsc/js/print-gallery.js` and into a dedicated JSON file:

```text
rsc/json/print-gallery.json
```

That would make the gallery easier to maintain, but the current JavaScript-array approach is simpler and reliable for a small static GitHub Pages page.
