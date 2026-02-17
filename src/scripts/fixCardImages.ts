/**
 * Fix Card Image URLs
 * Updates existing cards to have proper TCGdex image URLs with quality/extension
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

async function fixCardImages() {
  console.log('Fixing card image URLs...');
  
  const cards = await prisma.card.findMany();
  
  let fixed = 0;
  
  for (const card of cards) {
    let needsUpdate = false;
    let newImageUrl = card.imageUrl;
    let newImageUrlLarge = card.imageUrlLarge;
    
    // If imageUrl is empty, construct it from tcgdexId
    if (!card.imageUrl || card.imageUrl === '') {
      // Extract set and localId from tcgdexId (format: "setId-localId" or "setId-localId-tTier")
      const parts = card.tcgdexId.split('-t')[0]; // Remove tier suffix
      const [setId, localId] = card.setId && parts ? [card.setId, parts.split('-').pop()] : [null, null];
      
      if (setId && localId) {
        const baseUrl = `https://assets.tcgdex.net/en/${setId}/${localId}`;
        newImageUrl = `${baseUrl}/low.webp`;
        newImageUrlLarge = `${baseUrl}/high.webp`;
        needsUpdate = true;
      }
    }
    // If imageUrl exists but doesn't have extension, append it
    else if (!card.imageUrl.includes('.webp') && !card.imageUrl.includes('.png')) {
      newImageUrl = `${card.imageUrl}/low.webp`;
      newImageUrlLarge = card.imageUrlLarge && !card.imageUrlLarge.includes('.webp') 
        ? `${card.imageUrlLarge}/high.webp`
        : `${card.imageUrl}/high.webp`;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await prisma.card.update({
        where: { id: card.id },
        data: {
          imageUrl: newImageUrl,
          imageUrlLarge: newImageUrlLarge
        }
      });
      
      fixed++;
    }
  }
  
  console.log(`✓ Fixed ${fixed} card image URLs`);
  console.log('Done!');
  
  await prisma.$disconnect();
}

fixCardImages().catch((error) => {
  console.error('Error fixing card images:', error);
  process.exit(1);
});
