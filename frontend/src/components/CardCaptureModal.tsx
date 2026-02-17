/**
 * Card Capture Modal
 * Allows user to select one of three offered cards after winning
 */

import { useState } from 'react';

interface Card {
  id: number;
  tcgdexId: string;
  pokemonName: string;
  setName: string;
  rarity: string;
  tier: number;
  imageUrl: string;
  imageUrlLarge: string | null;
}

interface CardCaptureModalProps {
  gameId: number;
  offeredCards: Card[];
  guaranteedCardId: number;
  onPlayAgain: () => void;
  onExit: () => void;
  onClose: () => void;
  auth: { token: string };
}

export function CardCaptureModal({
  gameId,
  offeredCards,
  guaranteedCardId,
  onPlayAgain,
  onExit,
  onClose,
  auth
}: CardCaptureModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    if (!selectedCardId || loading) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:4000/games/${gameId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ cardId: selectedCardId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture card');
      }
      
      await response.json();
      // Close modal and let parent component handle state updates
      onClose();
    } catch (err: any) {
      console.error('Error capturing card:', err);
      alert(err.message || 'Failed to capture card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getRarityClass = (tier: number) => {
    if (tier <= 2) return 'rarity-legendary';
    if (tier <= 4) return 'rarity-rare';
    return 'rarity-common';
  };

  return (
    <div className="modal-backdrop">
      <div className="card-capture-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose Your Card!</h2>
        </div>

        <div className="offered-cards-grid">
          {offeredCards.map((card) => {
            const isGuaranteed = card.id === guaranteedCardId;
            const isSelected = selectedCardId === card.id;
            
            return (
              <div
                key={card.id}
                className={`offered-card ${getRarityClass(card.tier)} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCardId(card.id)}
              >
                {isGuaranteed && (
                  <div className="guaranteed-badge">Guaranteed</div>
                )}
                
                <div className="card-image-container">
                  <img
                    src={card.imageUrlLarge || card.imageUrl}
                    alt={capitalizeFirst(card.pokemonName)}
                    className="card-image"
                    onError={(e) => {
                      // Fallback to Pokemon sprite from PokeAPI
                      const pokemonName = card.pokemonName.toLowerCase();
                      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonName}.png`;
                      const currentTarget = e.currentTarget;
                      
                      // Try PokeAPI sprite
                      currentTarget.src = fallbackUrl;
                      currentTarget.onerror = () => {
                        // If that also fails, show placeholder
                        currentTarget.style.display = 'none';
                        const parent = currentTarget.parentElement;
                        if (parent && !parent.querySelector('.card-image-placeholder')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'card-image-placeholder';
                          fallback.textContent = capitalizeFirst(card.pokemonName).charAt(0);
                          parent.appendChild(fallback);
                        }
                      };
                    }}
                  />
                </div>
                
                <div className="card-info">
                  <h3 className="card-pokemon-name">{capitalizeFirst(card.pokemonName)}</h3>
                  <p className="card-set">{card.setName}</p>
                  <div className="card-rarity-badge">{card.rarity}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button
            className="capture-button"
            onClick={handleCapture}
            disabled={!selectedCardId || loading}
          >
            {loading ? 'Capturing...' : 'Confirm Capture'}
          </button>
        </div>
      </div>
    </div>
  );
}
