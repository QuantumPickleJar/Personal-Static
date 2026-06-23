# 3D Printing Gallery Maintenance Guide

This guide explains how to replace the placeholder 3D printing gallery entries with real projects.

The gallery is still static-site friendly. There is no public backend, database, payment flow, print request queue, customer upload system, or owner dashboard in this repository.

There is now an optional maintainer-only browser wizard on `3d-printing.html`. It can generate a gallery entry, upload a print image, and commit the update to GitHub when you provide a GitHub token for this repository.

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

## Tokenforge Generator handoff

Every gallery card includes **Customize / Request in Tokenforge**. It opens the configured Tokenforge Generator URL with a URL-safe base64 `handoff` query parameter. The payload follows `tokenforge.handoff.v1` and includes gallery identity and URLs, available print settings, and a customization-ready Generator project name. This portfolio does not create a payment, quote, or print queue.

The central endpoint configuration is in:

```text
rsc/js/tokenforge-config.js
```

Local previews default to `http://127.0.0.1:8080`; deployed pages use the clearly marked production placeholder until a public Generator URL is available. Set `data-tokenforge-generator-url` on the page's `<html>` element, or set `window.TOKENFORGE_GENERATOR_URL` before `print-gallery.js` loads, to override either default.

Add these optional fields to an entry when they are known so the handoff can prefill them:

```js
name: 'Project Title',
modelUrl: 'https://example.com/model',
previewUrl: 'https://example.com/preview',
estimatedGrams: 24,
estimatedTimeMinutes: 95,
```

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

## Maintainer wizard auth situation

Because this is a static GitHub Pages site, normal OAuth sign-in is not safe to implement directly in this repo. A browser-only OAuth flow would require exposing secrets or relying on an external backend/serverless function.

The implemented wizard uses the safer static-site compromise:

1. You open the 3D Printing Gallery page.
2. Click **Add gallery entry**.
3. Paste a GitHub token for your account.
4. The token is kept only in memory or `sessionStorage` for that browser tab.
5. The wizard calls the GitHub Contents API from your browser to commit the image and update `rsc/js/print-gallery.js`.

Recommended token type:

- GitHub fine-grained personal access token
- Repository access: `QuantumPickleJar/Personal-Static`
- Permissions: **Contents: Read and write**

Use the `main` branch after this feature is merged. While testing the feature branch, set the wizard branch field to:

```text
feat/3d-print-gallery
```

Security notes:

- Do not use the wizard on public/shared computers.
- Clear the saved token when done.
- Revoke the token from GitHub if you no longer need browser-based updates.
- Do not commit a token into this repository.

## Browser wizard workflow

Use this when you want the page to create the commit for you:

1. Open `3d-printing.html` in the deployed site or local preview.
2. Click **Add gallery entry**.
3. Enter the GitHub token and target branch.
4. Fill in the print title, description, material, colors, nozzle, layer height, model origin, notes, categories, tags, and alt text.
5. Select a print photo.
6. Choose the matching gallery filters.
7. Review the generated entry.
8. Click **Commit entry to GitHub**.

The wizard uploads the image to:

```text
assets/images/prints/<entry-slug>.<image-extension>
```

Then it prepends the generated object to:

```text
rsc/js/print-gallery.js
```

If no image is selected, the entry uses the existing placeholder image.

## Manual workflow for replacing a placeholder

Use this when you prefer editing files directly:

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
  name: 'Project Title',
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
  modelUrl: '',
  previewUrl: '',
  estimatedGrams: null,
  estimatedTimeMinutes: null,
  notes: 'What I learned, tuned, repaired, changed, or debugged during this print.',
  filters: ['designed-by-me', 'functional', 'repair-utility']
}
```

## Field reference

| Field | Purpose |
| --- | --- |
| `id` | Unique slug for the card. Use lowercase letters, numbers, and hyphens. |
| `name` | Handoff-friendly project name. Use the same value as `title` for normal gallery entries. |
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
| `modelUrl` | Optional direct model URL sent to Tokenforge. |
| `previewUrl` | Optional preview URL sent to Tokenforge; the gallery image is used when omitted. |
| `estimatedGrams` | Optional estimated filament weight sent to Tokenforge. |
| `estimatedTimeMinutes` | Optional estimated print time in minutes sent to Tokenforge. |
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

The wizard automatically adds `designed-by-me` when `sourceType` is `designed`, `printed-by-me` when `sourceType` is `printed`, and `remixed` when `sourceType` is `remixed`.

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
