# 3D Printing Gallery Maintenance Guide

This guide explains how the public 3D printing gallery is maintained now that the Pi-based `printdesk-gallery-auth` service is the intended admin path.

The portfolio remains static-site friendly. There is no public database, payment flow, print request queue, customer upload system, or owner dashboard in `Personal-Static`.

## Canonical gallery data

The canonical gallery data lives in:

```text
data/3d-print-gallery.json
```

The old inline `printGalleryItems` array in `rsc/js/print-gallery.js` is no longer the source of truth. The JavaScript now fetches and normalizes the JSON file for rendering, search, filters, pagination, and TokenForge handoff.

The safe empty starting shape is:

```json
{
  "entries": []
}
```

## Admin workflow

Entries are added through the Pi admin service in `QuantumPickleJar/printdesk-gallery-auth`.

The public portfolio page should never ask you to paste a GitHub personal access token into the browser. The admin service uses GitHub OAuth device flow, stores the resulting token server-side, and commits the JSON/images to `Personal-Static`.

The admin service URL is configured in:

```text
rsc/js/tokenforge-config.js
```

Local development currently falls back to:

```text
http://192.168.0.149:5175
```

That local fallback is only for the home-network Pi. For deployment, override it with `data-printdesk-gallery-admin-url` on the page's `<html>` element or set `window.PRINTDESK_GALLERY_ADMIN_URL` before `print-gallery.js` loads.

## Expected JSON shape

```json
{
  "entries": [
    {
      "id": "entry-slug",
      "title": "Title",
      "shortDescription": "Short description",
      "longDescription": "Long description",
      "material": "PLA",
      "printer": "Ender 3 Pro",
      "nozzle": "0.4mm",
      "layerHeight": "0.2mm",
      "printTime": "3h",
      "tags": ["tag"],
      "category": "Functional",
      "status": "Complete",
      "notes": "Notes",
      "images": ["assets/gallery/entry-slug/photo.jpg"],
      "attachment": null,
      "updatedAt": "2026-06-25T00:00:00.000Z"
    }
  ]
}
```

## Image and attachment paths

Uploaded images should be committed under:

```text
assets/gallery/<entry-id>/<filename>
```

Example:

```text
assets/gallery/commander-lid-with-text/photo.jpg
```

Attachments should be committed under:

```text
assets/gallery-attachments/<entry-id>/<filename>
```

Example:

```text
assets/gallery-attachments/commander-lid-with-text/model.3mf
```

Use compressed web-friendly images when possible:

- `.jpg` for normal photos
- `.webp` for smaller modern images
- `.png` only when transparency or crisp UI-like graphics matter

## How JSON is normalized for the page

`rsc/js/print-gallery.js` adapts the Pi service JSON into the existing card renderer:

| Pi JSON field | Public card behavior |
| --- | --- |
| `title` | Card title. |
| `shortDescription` / `longDescription` / `notes` | Card description fallback order. |
| `category` | Category chip and filter key source. |
| `images[0]` | Main card image. |
| `alt` / `altText` | Optional explicit alt text. If missing, the title is used to derive safe alt text. |
| `material`, `printer`, `nozzle`, `layerHeight`, `printTime`, `status` | Displayed in specs and included in search. |
| `tags`, `notes` | Displayed/searchable supporting metadata. |
| `attachment` | Optional link when present. |

Missing optional fields should render as `Not recorded` or another friendly fallback instead of crashing the page.

## TokenForge Generator handoff

Every gallery card includes **Customize / Request in Tokenforge**. It opens the configured TokenForge Generator URL with a URL-safe base64 `handoff` query parameter. The payload follows `tokenforge.handoff.v1` and includes gallery identity and URLs, available print settings, and a customization-ready Generator project name.

The central endpoint configuration is in:

```text
rsc/js/tokenforge-config.js
```

Local previews default to `http://127.0.0.1:8080`; deployed pages use the clearly marked production placeholder until a public Generator URL is available. Set `data-tokenforge-generator-url` on the page's `<html>` element, or set `window.TOKENFORGE_GENERATOR_URL` before `print-gallery.js` loads, to override either default.

Optional fields that improve handoff behavior when known:

```json
{
  "modelUrl": "https://example.com/model",
  "previewUrl": "https://example.com/preview",
  "estimatedGrams": 24,
  "estimatedTimeMinutes": 95
}
```

## Filter behavior

The page derives filter keys from `category`, `categories`, `tags`, and optional legacy `filters` values.

Examples:

| Display value | Derived filter key |
| --- | --- |
| `Functional` | `functional` |
| `Repair / Utility` | `repair-utility` |
| `Tokens / Cards` | `tokens-cards` |
| `Manual Filament Swap` | `manual-filament-swap` |

Search and filters operate on the same loaded JSON entries. Search includes title, descriptions, material, printer, nozzle, layer height, print time, status, notes, categories, and tags.

## Manual verification checklist

From the `Personal-Static` repair branch:

```bash
git status
```

Then run the existing local static preview or dev workflow.

Manual browser checks:

1. Open `3d-printing.html`.
2. Confirm the nav drawer includes `3D Printing`.
3. Open DevTools Network and confirm `data/3d-print-gallery.json` returns `200`.
4. Confirm an empty `{ "entries": [] }` file renders a friendly empty state.
5. Add one sample JSON entry manually and confirm it renders.
6. Confirm `assets/gallery/<entry-id>/<image>` image paths return `200`.
7. Confirm uploaded attachments under `assets/gallery-attachments/<entry-id>/` return `200` when linked.
8. Confirm search, filters, and pagination still work.
9. Confirm no console errors.

## Safe sample entry for local testing

Paste this into `data/3d-print-gallery.json` temporarily while testing, then remove it before using real production data:

```json
{
  "entries": [
    {
      "id": "sample-functional-print",
      "title": "Sample Functional Print",
      "shortDescription": "Temporary test entry for verifying the public gallery renderer.",
      "longDescription": "This should render from JSON, not from an inline JavaScript array.",
      "material": "PLA",
      "printer": "Ender 3 Pro",
      "nozzle": "0.4mm",
      "layerHeight": "0.2mm",
      "printTime": "3h",
      "tags": ["functional", "test"],
      "category": "Functional",
      "status": "Complete",
      "notes": "Delete this after verification.",
      "images": ["assets/images/prints/placeholder.svg"],
      "attachment": null,
      "updatedAt": "2026-06-25T00:00:00.000Z"
    }
  ]
}
```

## Deployment reminder

When the Pi admin service is deployed through systemd, the real `.env` belongs on the Pi only. Do not commit real secrets or OAuth client credentials into `Personal-Static`.
