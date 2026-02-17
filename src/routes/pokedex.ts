/**
 * Pokedex Routes
 * Endpoints for card collection management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

/**
 * GET /pokedex
 * Get user's Pokedex (all cards with capture status)
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    
    // Get all cards
    const allCards = await prisma.card.findMany({
      include: {
        pokemon: true
      },
      orderBy: [
        { pokemon: { pokedexNumber: 'asc' } },
        { tier: 'asc' }
      ]
    });
    
    // Get user's captured card IDs
    const capturedEntries = await prisma.pokedexEntry.findMany({
      where: { userId },
      select: {
        cardId: true,
        discovered: true
      }
    });
    
    const capturedMap = new Map(
      capturedEntries.map(entry => [entry.cardId, entry.discovered])
    );
    
    // Format response with capture status
    const pokedex = allCards.map(card => ({
      card,
      captured: isAdmin || capturedMap.has(card.id), // Admins see all as captured
      discovered: capturedMap.get(card.id) || null
    }));
    
    res.json(pokedex);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pokedex/stats
 * Get collection statistics
 */
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // Total cards in database
    const totalCards = await prisma.card.count();
    
    // User's collected cards
    const collectedCards = await prisma.pokedexEntry.count({
      where: { userId }
    });
    
    // Cards by rarity
    const cardsByRarity = await prisma.pokedexEntry.groupBy({
      by: ['cardId'],
      where: { userId },
      _count: true
    });
    
    const rarityStats = await Promise.all(
      cardsByRarity.map(async (entry: any) => {
        const card = await prisma.card.findUnique({
          where: { id: entry.cardId },
          select: { rarity: true }
        });
        return card?.rarity;
      })
    );
    
    const rarityCounts = rarityStats.reduce((acc: Record<string, number>, rarity: string | undefined) => {
      if (rarity) {
        acc[rarity] = (acc[rarity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Cards by biome (through games)
    const biomeStats = await prisma.game.groupBy({
      by: ['biomeId'],
      where: {
        userId,
        completed: true,
        won: true
      },
      _count: true
    });
    
    const biomeData = await Promise.all(
      biomeStats.map(async (stat: any) => {
        const biome = await prisma.biome.findUnique({
          where: { id: stat.biomeId },
          select: { name: true }
        });
        return {
          biome: biome?.name || 'Unknown',
          count: stat._count
        };
      })
    );
    
    // Rarest card owned
    const entries = await prisma.pokedexEntry.findMany({
      where: { userId },
      include: {
        card: true
      },
      orderBy: {
        discovered: 'desc'
      }
    });
    
    const rarestCard = entries.reduce((rarest: typeof entries[0] | null, entry: typeof entries[0]) => {
      const tierValue = entry.card.tier;
      if (!rarest || tierValue < rarest.card.tier) {
        return entry;
      }
      return rarest;
    }, null as typeof entries[0] | null);
    
    res.json({
      totalCards,
      collectedCards,
      completionPercentage: Math.round((collectedCards / totalCards) * 100),
      cardsByRarity: rarityCounts,
      cardsByBiome: biomeData,
      rarestCard: rarestCard?.card || null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pokedex/:cardId
 * Get details about a specific card in the Pokedex
 */
router.get('/:cardId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId);
    
    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'Invalid card ID' });
    }
    
    const entry = await prisma.pokedexEntry.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId
        }
      },
      include: {
        card: {
          include: {
            pokemon: true
          }
        }
      }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Card not in your Pokedex' });
    }
    
    // Get all instances of this card owned by user
    const userCards = await prisma.userCard.findMany({
      where: {
        userId,
        cardId
      },
      include: {
        game: {
          include: {
            biome: true
          }
        }
      },
      orderBy: {
        obtained: 'desc'
      }
    });
    
    res.json({
      ...entry,
      instances: userCards
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pokedex/cards/all (Admin only - for testing)
 * Get all cards in the system
 */
router.get('/cards/all', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await prisma.card.findMany({
      include: {
        pokemon: true
      },
      orderBy: [
        { tier: 'asc' },
        { pokemonName: 'asc' }
      ]
    });
    
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

export default router;
