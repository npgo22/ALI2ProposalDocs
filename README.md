# ALI2ProposalDocs

Documentation site for the [APRL ALI-2 instrumentation and control monorepo](https://github.com/npgo22/ALI2Proposal),
built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/)
and deployed to GitHub Pages.

Live site: <https://npgo22.github.io/ALI2ProposalDocs/>

## Structure

- `src/content/docs/` — design notes and the overview page.
- `src/content/docs/components/` — one page per component, each linking to its datasheets.
- `public/datasheets/` — reference datasheets and application notes, served as static files.

## Local development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into ./dist
npm run preview  # preview the production build
```

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on
every push to `main` (and via manual dispatch). For this to work, set
**Settings → Pages → Build and deployment → Source** to **GitHub Actions** in the
repository settings once.
