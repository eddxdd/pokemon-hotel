/**
 * Use local card images from frontend/public/images/cards/*.zip
 * - Extracts zips to frontend/public/images/cards/sets/{setFolder}/
 * - Maps set card numbers to Pokemon names via TCGdex API (only Kanto 151)
 * - Updates Card records to use /images/cards/sets/{set}/{number}.jpg
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { prisma } from '../lib/prisma.js';

const CARDS_DIR = path.join(process.cwd(), 'frontend', 'public', 'images', 'cards');
const SETS_DIR = path.join(CARDS_DIR, 'sets');

// Zip folder name (inside zip) -> TCGdex set ID and file number padding
const ZIP_TO_SET: Record<string, { tcgdexId: string; padLength: number }> = {
  base: { tcgdexId: 'base1', padLength: 3 },
  jungle: { tcgdexId: 'base2', padLength: 2 },
  fossil: { tcgdexId: 'base3', padLength: 2 },
  'team-rocket': { tcgdexId: 'base5', padLength: 2 },
};

// Normalize TCGdex card name to our DB Pokemon name
function normalizeCardNameToDb(name: string): string | null {
  let n = name
    .toLowerCase()
    .replace(/^dark\s+/, '')
    .trim();
  // TCGdex uses "Nidoran♂" / "Nidoran♀", "Mr. Mime", "Farfetch'd"
  if (n === "nidoran♂" || n === 'nidoran male') n = 'nidoran-m';
  else if (n === "nidoran♀" || n === 'nidoran female') n = 'nidoran-f';
  else if (n === "mr. mime" || n === 'mr mime') n = 'mr-mime';
  else if (n === "farfetch'd" || n === "farfetch'd") n = 'farfetchd';
  return n;
}

interface SetCard {
  setFolder: string;
  localId: string;
  paddedFile: string;
  dbName: string;
}

async function fetchSetCards(
  tcgdexSetId: string,
  setFolder: string,
  padLength: number,
  kantoNames: Set<string>
): Promise<SetCard[]> {
  const url = `https://api.tcgdex.net/v2/en/sets/${tcgdexSetId}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json() as { cards: Array<{ localId: string; name: string }> };
  const out: SetCard[] = [];
  for (const card of data.cards || []) {
    const dbName = normalizeCardNameToDb(card.name);
    if (!dbName || !kantoNames.has(dbName)) continue;
    const padded = card.localId.padStart(padLength, '0');
    out.push({
      setFolder,
      localId: card.localId,
      paddedFile: `${padded}.jpg`,
      dbName,
    });
  }
  return out;
}

function extractZip(zipPath: string, setFolder: string): void {
  const zip = new AdmZip(zipPath);
  const targetDir = path.join(SETS_DIR, setFolder);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  zip.extractAllTo(SETS_DIR, true);
  console.log(`  Extracted ${path.basename(zipPath)} -> sets/${setFolder}/`);
}

async function main() {
  console.log('Using local card images for 151 Kanto Pokemon\n');

  if (!fs.existsSync(CARDS_DIR)) {
    console.error('Cards directory not found:', CARDS_DIR);
    process.exit(1);
  }

  fs.mkdirSync(SETS_DIR, { recursive: true });

  // 1) Extract zips
  console.log('1) Extracting zips...');
  for (const [folder, _] of Object.entries(ZIP_TO_SET)) {
    const zipPath = path.join(CARDS_DIR, `${folder}.zip`);
    if (fs.existsSync(zipPath)) {
      extractZip(zipPath, folder);
    } else {
      console.log(`  Skip ${folder}.zip (not found)`);
    }
  }

  // 2) Load Kanto 151 names and build set card list from TCGdex
  const kanto = await prisma.pokemon.findMany({
    where: { generation: 1 },
    orderBy: { pokedexNumber: 'asc' },
  });
  const kantoNames = new Set(kanto.map((p) => p.name));

  console.log('\n2) Fetching set card lists from TCGdex (only Kanto 151)...');
  const allSetCards: SetCard[] = [];
  for (const [setFolder, { tcgdexId, padLength }] of Object.entries(ZIP_TO_SET)) {
    const cards = await fetchSetCards(tcgdexId, setFolder, padLength, kantoNames);
    allSetCards.push(...cards);
    console.log(`  ${setFolder} (${tcgdexId}): ${cards.length} Kanto Pokemon cards`);
  }

  // 3) For each of 151 Pokemon, pick first matching card (prefer base, then jungle, fossil, team-rocket)
  const order = ['base', 'jungle', 'fossil', 'team-rocket'];
  const pokemonToPath = new Map<string, string>();
  for (const folder of order) {
    for (const c of allSetCards) {
      if (c.setFolder !== folder) continue;
      if (pokemonToPath.has(c.dbName)) continue;
      const relPath = path.join(SETS_DIR, c.setFolder, c.paddedFile);
      if (fs.existsSync(relPath)) {
        const urlPath = `/images/cards/sets/${c.setFolder}/${c.paddedFile}`;
        pokemonToPath.set(c.dbName, urlPath);
      }
    }
  }

  console.log('\n3) Updating Card records...');
  let updated = 0;
  let missing: string[] = [];
  for (const pokemon of kanto) {
    const urlPath = pokemonToPath.get(pokemon.name);
    if (!urlPath) {
      missing.push(pokemon.name);
      continue;
    }
    const result = await prisma.card.updateMany({
      where: { pokemonId: pokemon.id },
      data: {
        imageUrl: urlPath,
        imageUrlLarge: urlPath,
      },
    });
    if (result.count > 0) {
      updated += result.count;
      console.log(`  ${pokemon.name} (#${pokemon.pokedexNumber}): ${result.count} cards -> ${urlPath}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated ${updated} card records to use local images.`);
  if (missing.length > 0) {
    console.log(`No local image found for ${missing.length} Pokemon: ${missing.join(', ')}`);
  } else {
    console.log('All 151 Kanto Pokemon now use local card images.');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
