# TODO - Netlify deploy prep

## Completed
- [x] Add `netlify.toml` with basic Next build config.
- [x] Add `start:standalone` / `netlify:start` scripts to `package.json`.

## Remaining
- [ ] Fix `package.json` scripts formatting (a duplicate `start` entry exists right now).
- [ ] Validate locally: run `prisma generate` + `next build` and ensure `.next/standalone/server.js` exists.
- [ ] Decide Netlify runtime handling for standalone output (likely via `netlify.toml` build/publish + a start command, or Netlify Next adapter).
- [ ] Add deployment documentation to README (Netlify env vars).
- [ ] Ensure `.env` is not committed; confirm secrets are only in Netlify dashboard.

