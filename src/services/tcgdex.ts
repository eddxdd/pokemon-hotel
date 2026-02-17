/**
 * TCGdex Service
 * Fetches Pokemon TCG card data from TCGdex API
 */

import TCGdex from '@tcgdex/sdk';

const tcg = new TCGdex('en');

export interface TCGCard {
  id: string;
  name: string;
  image?: string;
  localId: string;
  set: {
    id: string;
    name: string;
    logo?: string;
  };
  rarity: string;
}

export interface ProcessedCardData {
  tcgdexId: string;
  pokemonName: string;
  setId: string;
  setName: string;
  rarity: string;
  imageUrl: string;
  imageUrlLarge: string;
}

/**
 * Fetch all cards for a specific Pokemon
 */
export async function fetchCardsByPokemon(pokemonName: string): Promise<TCGCard[]> {
  try {
    const cards = await tcg.fetch('cards', pokemonName);
    
    if (Array.isArray(cards)) {
      return cards as TCGCard[];
    } else if (cards && typeof cards === 'object') {
      // Single card returned
      return [cards as TCGCard];
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching cards for ${pokemonName}:`, error);
    return [];
  }
}

/**
 * Fetch a specific card by ID
 */
export async function fetchCard(cardId: string): Promise<TCGCard | null> {
  try {
    const card = await tcg.fetch('cards', cardId);
    return card as TCGCard;
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    return null;
  }
}

/**
 * Process TCG card data into our database format
 */
export function processCardData(card: TCGCard): ProcessedCardData {
  // TCGdex URLs end without extension
  // Format: https://assets.tcgdex.net/en/swsh/swsh3/136
  // We need to append: /high.webp for standard, /high.png for large
  let baseImageUrl = card.image || '';
  
  // If no image provided AND card has set/localId, construct it manually
  // BUT we can't guarantee it exists on the CDN
  if (!baseImageUrl && card.set && card.localId) {
    baseImageUrl = `https://assets.tcgdex.net/en/${card.set.id}/${card.localId}`;
  }
  
  // Only append quality/extension if we have a base URL
  const imageUrl = baseImageUrl ? `${baseImageUrl}/low.webp` : '';
  const imageUrlLarge = baseImageUrl ? `${baseImageUrl}/high.webp` : '';
  
  // Mark if this card had an explicit image field (more likely to exist)
  const hasExplicitImage = !!card.image;
  
  return {
    tcgdexId: card.id,
    pokemonName: card.name,
    setId: card.set.id,
    setName: card.set.name,
    rarity: card.rarity || 'Common',
    imageUrl: hasExplicitImage ? imageUrl : '', // Only return URL if image field existed
    imageUrlLarge: hasExplicitImage ? imageUrlLarge : ''
  };
}

/**
 * Fetch and process all cards for a Pokemon
 */
export async function fetchProcessedCardsByPokemon(pokemonName: string): Promise<ProcessedCardData[]> {
  const cards = await fetchCardsByPokemon(pokemonName);
  return cards.map(processCardData);
}

/**
 * Fetch cards for multiple Pokemon with delay
 */
export async function fetchCardsBatch(
  pokemonNames: string[],
  delayMs: number = 200
): Promise<Map<string, ProcessedCardData[]>> {
  const results = new Map<string, ProcessedCardData[]>();
  
  for (const name of pokemonNames) {
    try {
      const cards = await fetchProcessedCardsByPokemon(name);
      results.set(name, cards);
      
      console.log(`Fetched ${cards.length} cards for ${name}`);
      
      // Delay to respect rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to fetch cards for ${name}, skipping...`);
      results.set(name, []);
    }
  }
  
  return results;
}
