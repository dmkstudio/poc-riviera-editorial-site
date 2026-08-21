# POC — Riviera Editorial

Standalone trilingual production site for Private Office Consulting on the French Riviera.

## Continue development

```bash
npm install
npm run dev
```

Open `http://localhost:3001/` (or use the port printed by the dev server).

Quality checks:

```bash
npm run lint
npm test
npm run build
```

The site includes responsive desktop/mobile layouts, English/French/Russian copy, Motion interactions, service content, validated request handling, accessibility and reduced-motion support.

## Project map

- `app/` — pages, components, styles and request API
- `public/` — production images, fonts and SVG contact icons
- `tests/` — automated checks
- `vercel.json` — deployment/security headers
- `.vercel/project.json` — linked Vercel project metadata
- `build/`, `db/`, `drizzle/`, `worker/` — supporting application infrastructure

## Published references

- Vercel: https://poc-riviera-editorial-site.vercel.app
- GitHub: https://github.com/dmkstudio/poc-riviera-editorial-site
- Draft PR: https://github.com/dmkstudio/poc-riviera-editorial-site/pull/1

The Desktop archive intentionally excludes `node_modules`, framework build output, browser captures and local QA caches. Recreate dependencies with `npm install`; regenerate build output with `npm run build`.
