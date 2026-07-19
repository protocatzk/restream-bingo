# Restream Bingo

Einstellbares **Online-Bingo** mit [Astro](https://astro.build) – rein statisch, ohne Backend. Deploy auf **Vercel** und/oder **GitHub Pages**.

## Features

- Titel, Rastergröße (3×3–7×7), freies Mittelfeld
- Eigene Phrasen (eine pro Zeile) + Seed für gleiches Board
- Markieren, Bingo-Erkennung (Zeile / Spalte / Diagonale)
- **Kurze Share-Links** im Hash (`#2.…` / `#3.…`)
- Dark UI, zero framework JS

## Lokal starten

```bash
nvm use          # Node 22 (.nvmrc)
yarn install
yarn dev         # http://localhost:4321
```

```bash
yarn build
yarn preview
```

## Share-Links

| Prefix | Inhalt |
|--------|--------|
| `3.` | deflate-komprimiertes Packformat |
| `2.` | Packformat ohne Kompression |
| (ohne) | Legacy JSON+Base64 (`?c=…`) – wird weiterhin gelesen |

Beispiel:

```
https://example.com/#2.NQAxAABzdHJlYW0tNDIA
```

Standard-Titel und -Phrasen werden **nicht** mitkodiert → Default-Boards bleiben sehr kurz.

## Deploy (GitHub Actions)

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)  
Triggert auf `main` und `stream`.

| Job | Ziel | `BASE_PATH` |
|-----|------|-------------|
| **GitHub Pages** | `https://USER.github.io/REPO/` | `/REPO/` |
| **Vercel** | Production | `/` |

### GitHub Pages

1. **Settings → Pages → Source: GitHub Actions**
2. Push auf `stream` / `main`

### Vercel (optional, in derselben Action)

Repo-Secrets:

| Secret | Quelle |
|--------|--------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` (nach `npx vercel link`) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

Optional: Variable `SITE_URL`.

Ohne Secrets wird der Vercel-Job übersprungen.

### Manuell

```bash
yarn vercel --prod   # oder: npx vercel --prod

BASE_PATH=/restream-bingo/ SITE_URL=https://USER.github.io yarn build
```

## Nutzung

1. **Einstellungen** → Titel, Größe, Phrasen
2. **Übernehmen & mischen**
3. Felder antippen
4. Tab **Teilen** → Link kopieren

## Spezial-Boards (Presets)

Feste Boards unter kurzem Pfad – gleicher Seed für alle Zuschauer:

| Pfad | Seed | Beschreibung |
|------|------|----------------|
| [`/dkm`](./src/pages/dkm.astro) | `dkm` | DKM Bingo (locked layout) |

Preset-Config: [`src/lib/presets.ts`](./src/lib/presets.ts).  
Share-Link ist der saubere Pfad (ohne Hash); Markierungen speichern lokal pro Preset.

## Lizenz

MIT
