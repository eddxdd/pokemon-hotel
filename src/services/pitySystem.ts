/**
 * Pity System Service
 * Tracks and manages the gacha pity system for card drops
 */

import { PityTracker } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export interface PityState {
  consecutiveTier6: number;
  consecutiveTier5: number;
  gamesWithoutCeiling: number;
  hardPityCounter: number;
  totalGames: number;
  lastCeilingPull: Date | null;
}

/**
 * Get or create pity tracker for a user
 */
export async function getPityTracker(userId: number): Promise<PityState> {
  let tracker = await prisma.pityTracker.findUnique({
    where: { userId }
  });
  
  if (!tracker) {
    tracker = await prisma.pityTracker.create({
      data: { userId }
    });
  }
  
  return {
    consecutiveTier6: tracker.consecutiveTier6,
    consecutiveTier5: tracker.consecutiveTier5,
    gamesWithoutCeiling: tracker.gamesWithoutCeiling,
    hardPityCounter: tracker.hardPityCounter,
    totalGames: tracker.totalGames,
    lastCeilingPull: tracker.lastCeilingPull
  };
}

/**
 * Update pity tracker after a game
 */
export async function updatePityTracker(
  userId: number,
  tier: number,
  pulledCeiling: boolean
): Promise<PityState> {
  const tracker = await getPityTracker(userId);
  
  const updates: Partial<PityTracker> = {
    totalGames: tracker.totalGames + 1,
    hardPityCounter: tracker.hardPityCounter + 1
  };
  
  // Update consecutive tier counters
  if (tier === 6) {
    updates.consecutiveTier6 = tracker.consecutiveTier6 + 1;
    updates.consecutiveTier5 = 0; // Reset tier 5 counter
  } else if (tier === 5) {
    updates.consecutiveTier5 = tracker.consecutiveTier5 + 1;
    updates.consecutiveTier6 = 0; // Reset tier 6 counter
  } else {
    // Better performance, reset both
    updates.consecutiveTier6 = 0;
    updates.consecutiveTier5 = 0;
  }
  
  // Update ceiling tracking
  if (pulledCeiling) {
    updates.gamesWithoutCeiling = 0;
    updates.hardPityCounter = 0;
    updates.lastCeilingPull = new Date();
  } else {
    updates.gamesWithoutCeiling = tracker.gamesWithoutCeiling + 1;
  }
  
  const updated = await prisma.pityTracker.update({
    where: { userId },
    data: updates
  });
  
  return {
    consecutiveTier6: updated.consecutiveTier6,
    consecutiveTier5: updated.consecutiveTier5,
    gamesWithoutCeiling: updated.gamesWithoutCeiling,
    hardPityCounter: updated.hardPityCounter,
    totalGames: updated.totalGames,
    lastCeilingPull: updated.lastCeilingPull
  };
}

/**
 * Calculate weight modifiers based on pity state
 */
export function calculatePityModifiers(pity: PityState): {
  ceilingWeightMultiplier: number;
  guaranteeCeiling: boolean;
  tierBoost: boolean;
} {
  let ceilingWeightMultiplier = 1.0;
  let guaranteeCeiling = false;
  let tierBoost = false;
  
  // Hard Pity - Guarantee ceiling at 10 games
  if (pity.hardPityCounter >= 10) {
    guaranteeCeiling = true;
    return { ceilingWeightMultiplier, guaranteeCeiling, tierBoost };
  }
  
  // Soft Pity - Based on consecutive poor performance
  if (pity.consecutiveTier6 >= 3) {
    // 3+ consecutive tier 6: Major boost + tier boost chance
    ceilingWeightMultiplier = 2.5;
    tierBoost = Math.random() < 0.2; // 20% chance for tier boost
  } else if (pity.consecutiveTier6 === 2) {
    // 2 consecutive tier 6: Moderate boost
    ceilingWeightMultiplier = 1.5;
  }
  
  // Alternative soft pity: Games without ceiling
  if (pity.gamesWithoutCeiling >= 7) {
    ceilingWeightMultiplier = Math.max(ceilingWeightMultiplier, 2.0);
  } else if (pity.gamesWithoutCeiling >= 5) {
    ceilingWeightMultiplier = Math.max(ceilingWeightMultiplier, 1.3);
  }
  
  return { ceilingWeightMultiplier, guaranteeCeiling, tierBoost };
}

/**
 * Reset pity tracker (for testing/admin purposes)
 */
export async function resetPityTracker(userId: number): Promise<void> {
  await prisma.pityTracker.update({
    where: { userId },
    data: {
      consecutiveTier6: 0,
      consecutiveTier5: 0,
      gamesWithoutCeiling: 0,
      hardPityCounter: 0,
      lastCeilingPull: null
    }
  });
}
