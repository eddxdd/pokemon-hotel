/**
 * Card Generator Service
 * Generates card offers based on tier and pity system
 */

import { Card } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { getPityTracker, calculatePityModifiers } from './pitySystem.js';

export interface CardOffer {
  cards: Card[];
  guaranteedCard: Card;
  appliedPity: {
    ceilingBoost: number;
    tierBoost: boolean;
    hardPity: boolean;
  };
}

/**
 * Generate 3 card offers for a completed game
 * Returns [guaranteedPokemonCard, randomCard1, randomCard2]
 */
export async function generateCardOffers(
  userId: number,
  tier: number,
  guaranteedPokemonId: number
): Promise<CardOffer> {
  // Get pity state
  const pityState = await getPityTracker(userId);
  const pityModifiers = calculatePityModifiers(pityState);
  
  // Apply tier boost if activated
  let effectiveTier = tier;
  if (pityModifiers.tierBoost && tier > 1) {
    effectiveTier = Math.max(1, tier - 1);
    console.log(`Tier boost activated! ${tier} → ${effectiveTier}`);
  }
  
  // Get guaranteed card (the guessed Pokemon) - MUST be from the guessed Pokemon
  let guaranteedCard = await selectGuaranteedCard(guaranteedPokemonId, effectiveTier);
  
  if (!guaranteedCard) {
    // This should not happen if database is properly seeded
    // Log error but don't fallback to random Pokemon
    throw new Error(`No cards found for Pokemon ${guaranteedPokemonId}. Please ensure all Pokemon have cards in the database.`);
  }
  
  // Generate 2 random cards
  let randomCard1;
  let randomCard2;
  
  try {
    randomCard1 = await selectRandomCard(
      effectiveTier,
      pityModifiers.ceilingWeightMultiplier,
      pityModifiers.guaranteeCeiling,
      [guaranteedCard.id]
    );
  } catch (error) {
    console.error('Error selecting random card 1:', error);
    // Fallback: use any card from any tier
    randomCard1 = await prisma.card.findFirst({
      where: { id: { not: guaranteedCard.id } }
    });
    if (!randomCard1) randomCard1 = guaranteedCard; // Ultimate fallback
  }
  
  try {
    randomCard2 = await selectRandomCard(
      effectiveTier,
      pityModifiers.ceilingWeightMultiplier,
      pityModifiers.guaranteeCeiling,
      [guaranteedCard.id, randomCard1.id]
    );
  } catch (error) {
    console.error('Error selecting random card 2:', error);
    // Fallback: use any card from any tier
    randomCard2 = await prisma.card.findFirst({
      where: { id: { notIn: [guaranteedCard.id, randomCard1.id] } }
    });
    if (!randomCard2) randomCard2 = guaranteedCard; // Ultimate fallback
  }
  
  return {
    cards: [guaranteedCard, randomCard1, randomCard2],
    guaranteedCard,
    appliedPity: {
      ceilingBoost: pityModifiers.ceilingWeightMultiplier,
      tierBoost: pityModifiers.tierBoost,
      hardPity: pityModifiers.guaranteeCeiling
    }
  };
}

/**
 * Select the guaranteed card (matching the guessed Pokemon)
 */
async function selectGuaranteedCard(pokemonId: number, tier: number): Promise<Card | null> {
  console.log(`selectGuaranteedCard called with pokemonId=${pokemonId}, tier=${tier}`);
  
  // Get all cards for this Pokemon in this tier
  const cards = await prisma.card.findMany({
    where: {
      pokemonId,
      tier
    }
  });
  
  console.log(`Found ${cards.length} cards for Pokemon ${pokemonId} in tier ${tier}`);
  
  if (cards.length === 0) {
    console.log(`No cards for Pokemon ${pokemonId} in tier ${tier}, trying fallback...`);
    
    // Fallback 1: try adjacent tiers (±1)
    const fallbackCards1 = await prisma.card.findMany({
      where: {
        pokemonId,
        tier: {
          in: [Math.max(1, tier - 1), Math.min(6, tier + 1)]
        }
      }
    });
    
    console.log(`Fallback 1: Found ${fallbackCards1.length} cards in adjacent tiers`);
    
    if (fallbackCards1.length > 0) {
      return selectWeightedRandom(fallbackCards1);
    }
    
    // Fallback 2: try ANY tier for this Pokemon
    const fallbackCards2 = await prisma.card.findMany({
      where: {
        pokemonId
      }
    });
    
    console.log(`Fallback 2: Found ${fallbackCards2.length} cards in any tier for Pokemon ${pokemonId}`);
    
    if (fallbackCards2.length > 0) {
      return selectWeightedRandom(fallbackCards2);
    }
    
    console.error(`No cards found at all for Pokemon ${pokemonId}`);
    return null;
  }
  
  return selectWeightedRandom(cards);
}

/**
 * Select a random card with pity modifiers
 */
async function selectRandomCard(
  tier: number,
  ceilingWeightMultiplier: number,
  guaranteeCeiling: boolean,
  excludeIds: number[]
): Promise<Card> {
  // If hard pity, guarantee ceiling card
  if (guaranteeCeiling) {
    const ceilingCards = await prisma.card.findMany({
      where: {
        tier,
        isCeiling: true,
        id: { notIn: excludeIds }
      }
    });
    
    if (ceilingCards.length > 0) {
      return ceilingCards[Math.floor(Math.random() * ceilingCards.length)];
    }
  }
  
  // Get all cards in this tier
  const cards = await prisma.card.findMany({
    where: {
      tier,
      id: { notIn: excludeIds }
    }
  });
  
  if (cards.length === 0) {
    throw new Error(`No cards available for tier ${tier}`);
  }
  
  // Apply pity weight boost to ceiling cards
  const weightedCards = cards.map((card: any) => ({
    card,
    weight: card.isCeiling
      ? card.weight * ceilingWeightMultiplier
      : card.weight
  }));
  
  return selectWeightedRandom(weightedCards.map((w: any) => w.card), weightedCards.map((w: any) => w.weight));
}

/**
 * Select a random item from array using weighted probability
 */
function selectWeightedRandom<T extends { weight?: number }>(
  items: T[],
  customWeights?: number[]
): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  
  if (items.length === 1) {
    return items[0];
  }
  
  // Use custom weights if provided, otherwise use item.weight
  const weights = customWeights || items.map((item: any) => item.weight || 1);
  const totalWeight = weights.reduce((sum: number, w: number) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  // Fallback (shouldn't happen)
  return items[items.length - 1];
}

/**
 * Get Pokemon pool for a biome and time of day
 */
export async function getPokemonPool(biomeId: number, timeOfDay: string): Promise<number[]> {
  const spawns = await prisma.pokemonSpawn.findMany({
    where: {
      biomeId,
      OR: [
        { timeOfDay },
        { timeOfDay: 'both' }
      ]
    },
    select: {
      pokemonId: true,
      spawnWeight: true
    }
  });
  
  if (spawns.length === 0) {
    throw new Error(`No Pokemon available for biome ${biomeId} at ${timeOfDay}`);
  }
  
  // Weight-based selection
  const weighted = spawns.map((s: any) => ({
    id: s.pokemonId,
    weight: s.spawnWeight
  }));
  
  return weighted.map(w => w.id);
}

/**
 * Select a random Pokemon from the pool
 */
export async function selectRandomPokemon(biomeId: number, timeOfDay: string): Promise<number> {
  // Only select Pokemon that have cards available; prefer spawns matching timeOfDay
  let spawns = await prisma.pokemonSpawn.findMany({
    where: {
      biomeId,
      OR: [
        { timeOfDay },
        { timeOfDay: 'both' }
      ],
      pokemon: {
        cards: { some: {} }
      }
    }
  });

  // If no spawns for this time (e.g. Cemetery at day - Ghost only at night), use any spawn in biome
  if (spawns.length === 0) {
    spawns = await prisma.pokemonSpawn.findMany({
      where: {
        biomeId,
        pokemon: {
          cards: { some: {} }
        }
      }
    });
  }

  if (spawns.length === 0) {
    throw new Error(`No Pokemon with cards available for biome ${biomeId}`);
  }
  
  const weights = spawns.map((s: any) => s.spawnWeight);
  const totalWeight = weights.reduce((sum: number, w: number) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < spawns.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return spawns[i].pokemonId;
    }
  }
  
  return spawns[spawns.length - 1].pokemonId;
}
