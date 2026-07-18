# Restream Bingo

Einfacher **Online-Bingo-Prototyp** mit [Astro](https://astro.build) – rein statisch, einstellbar und bereit für **Vercel** oder **GitHub Pages**.

## Features

- Einstellbarer Titel, Rastergröße (3×3–7×7), freies Mittelfeld
- Eigene Phrasen (eine pro Zeile)
- Optionaler **Seed** für reproduzierbare Boards
- Felder markieren, Gewinn-Erkennung (Zeile / Spalte / Diagonale)
- Share-Link mit eingebetteter Config (`?c=…`)
- Dark UI, kein Backend, kein Framework-JS

## Entwicklung

```bash
# Node via nvm
nvm use   # oder: nvm install 22

npm install
npm run dev
```

Öffne die URL aus dem Terminal (meist `http://localhost:4321`).

## Build

```bash
npm run build
npm run preview
```

Ausgabe liegt in `dist/`.

## Deploy

### Vercel

1. Repo mit Vercel verbinden **oder** CLI:

```bash
npx vercel
```

Astro wird als Static Site erkannt. Optional Environment:

| Variable   | Beispiel                    | Zweck                          |
|-----------|-----------------------------|--------------------------------|
| `SITE_URL`| `https://bingo.example.com` | Canonical URL in `astro.config` |

### GitHub Pages

Für ein **Projekt-Repo** (URL `https://user.github.io/restream-bingo/`):

```bash
BASE_PATH=/restream-bingo/ SITE_URL=https://USER.github.io npm run build
```

Oder in GitHub Actions (Beispiel):

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: /restream-bingo/
          SITE_URL: https://${{ github.repository_owner }}.github.io
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Passe `BASE_PATH` an den **Repo-Namen** an.

## Nutzung

1. **Einstellungen** öffnen → Titel, Größe, Phrasen anpassen
2. **Übernehmen & mischen** → neues Board
3. Felder antippen zum Markieren
4. Tab **Teilen** → Link für Zuschauer kopieren

## Lizenz

MIT – frei zum Anpassen für deinen Stream.
