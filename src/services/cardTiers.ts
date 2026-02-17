/**
 * Card Tier Mapping Service
 * Maps TCG rarities to game performance tiers (1-6)
 */

export type CardRarity = 
  | 'Common'
  | 'Uncommon' 
  | 'Rare'
  | 'Double Rare'
  | 'Illustration Rare'
  | 'Super Rare'
  | 'Special Illustration Rare'
  | 'Immersive'
  | 'Shiny Rare'
  | 'Shiny Super Rare'
  | 'Ultra Rare';

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Tier 1 (1 try - best performance):
 * - Illustration Rare, Special Illustration Rare, Immersive, Shiny Rare, Shiny Super Rare, Ultra Rare
 * 
 * Tier 2 (2 tries):
 * - Double Rare, Illustration Rare, Super Rare, Special Illustration Rare, Ultra Rare
 * 
 * Tier 3 (3 tries):
 * - Rare, Double Rare, Illustration Rare, Super Rare
 * 
 * Tier 4 (4 tries):
 * - Uncommon, Rare, Double Rare, Illustration Rare
 * 
 * Tier 5 (5 tries):
 * - Common, Uncommon, Rare, Double Rare
 * 
 * Tier 6 (6 tries - worst performance):
 * - Common, Uncommon, Rare
 */
const TIER_RARITY_MAP: Record<Tier, CardRarity[]> = {
  1: ['Illustration Rare', 'Special Illustration Rare', 'Immersive', 'Shiny Rare', 'Shiny Super Rare', 'Ultra Rare'],
  2: ['Double Rare', 'Illustration Rare', 'Super Rare', 'Special Illustration Rare', 'Ultra Rare'],
  3: ['Rare', 'Double Rare', 'Illustration Rare', 'Super Rare'],
  4: ['Uncommon', 'Rare', 'Double Rare', 'Illustration Rare'],
  5: ['Common', 'Uncommon', 'Rare', 'Double Rare'],
  6: ['Common', 'Uncommon', 'Rare']
};

/**
 * Reverse map: rarity to possible tiers
 */
const RARITY_TO_TIERS: Record<string, Tier[]> = {
  'Common': [5, 6],
  'Uncommon': [4, 5, 6],
  'Rare': [3, 4, 5, 6],
  'Double Rare': [2, 3, 4, 5],
  'Illustration Rare': [1, 2, 3, 4],
  'Super Rare': [2, 3],
  'Special Illustration Rare': [1, 2],
  'Immersive': [1],
  'Shiny Rare': [1],
  'Shiny Super Rare': [1],
  'Ultra Rare': [1, 2]
};

/**
 * Default drop weights for each rarity within a tier
 */
const RARITY_WEIGHTS: Record<string, number> = {
  'Common': 50,
  'Uncommon': 30,
  'Rare': 15,
  'Double Rare': 8,
  'Illustration Rare': 5,
  'Super Rare': 3,
  'Special Illustration Rare': 2,
  'Immersive': 1,
  'Shiny Rare': 1,
  'Shiny Super Rare': 1,
  'Ultra Rare': 2
};

/**
 * Get all rarities available in a specific tier
 */
export function getRaritiesForTier(tier: Tier): CardRarity[] {
  return TIER_RARITY_MAP[tier] || [];
}

/**
 * Get all tiers where a rarity can appear
 */
export function getTiersForRarity(rarity: string): Tier[] {
  return RARITY_TO_TIERS[rarity] || [];
}

/**
 * Check if a rarity belongs to a specific tier
 */
export function isRarityInTier(rarity: string, tier: Tier): boolean {
  const raritiesInTier = getRaritiesForTier(tier);
  return raritiesInTier.includes(rarity as CardRarity);
}

/**
 * Get the drop weight for a rarity
 */
export function getWeightForRarity(rarity: string): number {
  return RARITY_WEIGHTS[rarity] || 1;
}

/**
 * Determine if a card is a floor card (lowest rarity) in its tier
 */
export function isFloorCard(rarity: string, tier: Tier): boolean {
  const raritiesInTier = getRaritiesForTier(tier);
  if (raritiesInTier.length === 0) return false;
  
  // Floor is the first rarity in the tier list (most common)
  return raritiesInTier[0] === rarity;
}

/**
 * Determine if a card is a ceiling card (highest rarity) in its tier
 */
export function isCeilingCard(rarity: string, tier: Tier): boolean {
  const raritiesInTier = getRaritiesForTier(tier);
  if (raritiesInTier.length === 0) return false;
  
  // Ceiling is the last rarity in the tier list (most rare)
  return raritiesInTier[raritiesInTier.length - 1] === rarity;
}

/**
 * Normalize TCGdex rarity names to our standard names
 */
export function normalizeRarity(tcgRarity: string): string {
  // TCGdex might use variations like "Rare Holo", "Rare Ultra", etc.
  // Map them to our standard rarities
  const normalized = tcgRarity.toLowerCase().trim();
  
  if (normalized.includes('ultra rare') || normalized === 'ultra rare') {
    return 'Ultra Rare';
  }
  if (normalized.includes('shiny super rare')) {
    return 'Shiny Super Rare';
  }
  if (normalized.includes('shiny rare')) {
    return 'Shiny Rare';
  }
  if (normalized.includes('immersive')) {
    return 'Immersive';
  }
  if (normalized.includes('special illustration rare') || normalized === 'special illustration rare') {
    return 'Special Illustration Rare';
  }
  if (normalized.includes('illustration rare') || normalized === 'illustration rare') {
    return 'Illustration Rare';
  }
  if (normalized.includes('super rare') || normalized === 'super rare') {
    return 'Super Rare';
  }
  if (normalized.includes('double rare') || normalized === 'double rare') {
    return 'Double Rare';
  }
  if (normalized.includes('rare')) {
    return 'Rare';
  }
  if (normalized.includes('uncommon')) {
    return 'Uncommon';
  }
  if (normalized.includes('common')) {
    return 'Common';
  }
  
  // Default to Common if unknown
  return 'Common';
}

/**
 * Assign a tier to a card based on its rarity
 * Returns the highest tier (best) where this rarity can appear
 */
export function assignTierToCard(rarity: string): Tier {
  const tiers = getTiersForRarity(rarity);
  
  if (tiers.length === 0) {
    // Unknown rarity, default to tier 6
    return 6;
  }
  
  // Return the lowest number (best tier) where this rarity can appear
  return Math.min(...tiers) as Tier;
}

/**
 * Get all possible tiers for a card
 */
export function getAllTiersForCard(rarity: string): Tier[] {
  return getTiersForRarity(rarity);
}
