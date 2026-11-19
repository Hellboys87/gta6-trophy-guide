// Leonida Platinum — handover program for the gta6-trophy-guide-01 entry.
//
// The entry itself is the static site in app/: index.html plus its CSS, ES
// modules and data/trophies.json, with no build step and no network loads.
// This program's only job is to hand that site in the way the bounty expects:
// copy app/ and screenshots/ into the output directory, then write
// dossier.json there using the vendored make.fun library — byte for byte the
// dossier the scorer will rebuild and compare against, so
// vendor/makefun-frontend.ts must stay exactly as shipped.
//
// Run it the way the grader does (output defaults to /output), or locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the site itself with `node serve.ts` and http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fresh output folders for the two payloads, then copy them across whole.
mkdirSync(join(outputDir, 'app'), { recursive: true });
cpSync(join(entryDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(entryDir, 'screenshots'))) {
  cpSync(join(entryDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate: the text cap shapes the dossier bytes,
// the rest simply refuse anything the scorer would refuse — at most four
// screenshots of at most 256 KiB each, and an app/ of at most 993 entries
// totalling at most 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
