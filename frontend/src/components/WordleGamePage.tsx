/**
 * Wordle Game Page
 * Main Pokemon Wordle gameplay interface
 */

import { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface GuessFeedback {
  type1: 'correct' | 'partial' | 'wrong' | 'n/a';
  type2: 'correct' | 'partial' | 'wrong' | 'n/a';
  evolutionStage: 'correct' | 'wrong' | 'n/a';
  fullyEvolved: 'correct' | 'wrong' | 'n/a';
  color: 'correct' | 'wrong' | 'n/a';
  generation: 'correct' | 'wrong' | 'n/a';
}

interface Guess {
  guessNum: number;
  pokemon: Pokemon;
  feedback: GuessFeedback;
}

interface WordleGamePageProps {
  gameId: number;
  onGameComplete: (won: boolean, tier: number, offeredCards: any[]) => void;
  shouldRefetch?: boolean;
  onBack: () => void;
  auth: { token: string };
}

export function WordleGamePage({ gameId, onGameComplete, shouldRefetch, onBack, auth }: WordleGamePageProps) {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [won, setWon] = useState(false);
  const [answer, setAnswer] = useState<Pokemon | null>(null);
  const [tier, setTier] = useState<number | null>(null);
  const [biomeId, setBiomeId] = useState<number | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);
  const [offeredCards, setOfferedCards] = useState<any[]>([]);
  const [cardCaptured, setCardCaptured] = useState(false);

  const maxGuesses = 6;
  
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchGameState();
  }, [gameId]);
  
  // Refetch when shouldRefetch prop changes
  useEffect(() => {
    if (shouldRefetch) {
      fetchGameState();
    }
  }, [shouldRefetch]);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`http://localhost:4000/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }
      
      const data = await response.json();
      setGuesses(data.guesses || []);
      setGameCompleted(data.completed);
      setWon(data.won);
      setTier(data.tier);
      setBiomeId(data.biome.id);
      setTimeOfDay(data.timeOfDay);
      
      // Check if card was already captured for this game
      setCardCaptured(!!data.capturedCardId);
      
      if (data.completed) {
        setAnswer(data.answer);
        
        // Set offered cards if available
        if (data.offeredCards && data.offeredCards.length === 3) {
          setOfferedCards(data.offeredCards);
        }
      }
      
      // Fetch ALL Pokemon (not just biome-specific)
      fetchAllPokemon();
    } catch (err) {
      console.error('Error fetching game state:', err);
    }
  };

  const fetchAllPokemon = async () => {
    try {
      const response = await fetch(`http://localhost:4000/games/pokemon`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Pokemon list');
      }
      
      const data = await response.json();
      setPokemonList(data);
    } catch (err) {
      console.error('Error fetching Pokemon list:', err);
    }
  };

  const handleSubmitGuess = async () => {
    if (!selectedPokemon || loading) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:4000/games/${gameId}/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ pokemonId: selectedPokemon.id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit guess');
      }
      
      const data = await response.json();
      
      setGuesses([...guesses, data.guess]);
      setSelectedPokemon(null);
      setSearchTerm('');
      
      if (data.gameCompleted) {
        setGameCompleted(true);
        setWon(data.won);
        setAnswer(data.answer);
        setTier(data.tier);
        
        console.log('Game completed response:', { 
          won: data.won, 
          tier: data.tier,
          offeredCards: data.offeredCards,
          offeredCardsLength: data.offeredCards?.length 
        });
        
        const cards = Array.isArray(data.offeredCards) && data.offeredCards.length === 3
          ? data.offeredCards
          : [];
        setOfferedCards(cards);
        
        if (cards.length === 3) {
          console.log('Calling onGameComplete with cards:', cards);
          onGameComplete(data.won, data.tier, cards);
        } else {
          console.log('Refetching game state to get offered cards...');
          // Refetch game state in case offered cards are available from server
          const refetch = await fetch(`http://localhost:4000/games/${gameId}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          });
          if (refetch.ok) {
            const gameData = await refetch.json();
            console.log('Refetched game data:', {
              offeredCards: gameData.offeredCards,
              offeredCardsLength: gameData.offeredCards?.length
            });
            if (Array.isArray(gameData.offeredCards) && gameData.offeredCards.length === 3) {
              setOfferedCards(gameData.offeredCards); // <-- THIS WAS MISSING BEFORE!
              onGameComplete(data.won, data.tier, gameData.offeredCards);
            } else {
              console.error('Still no valid offered cards after refetch');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPokemon = pokemonList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFeedbackIcon = (feedback: 'correct' | 'partial' | 'wrong' | 'n/a') => {
    if (feedback === 'n/a') return <span className="na-indicator">✕</span>;
    if (feedback === 'correct') return '🟢'; // Master Ball
    if (feedback === 'partial') return '🟡'; // Great Ball
    return '⚪'; // Poke Ball
  };

  const renderGuessGrid = () => {
    const rows = [];
    
    for (let i = 0; i < maxGuesses; i++) {
      const guess = guesses[i];
      
      if (guess) {
        rows.push(
          <div key={i} className="wordle-row">
            <div className="wordle-cell pokemon-name">
              {capitalizeFirst(guess.pokemon.name)}
              {guess.pokemon.imageUrl && (
                <img src={guess.pokemon.imageUrl} alt={capitalizeFirst(guess.pokemon.name)} className="pokemon-icon" />
              )}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.type1.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.type1)}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.type2.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.type2)}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.evolutionStage.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.evolutionStage)}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.fullyEvolved.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.fullyEvolved)}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.color.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.color)}
            </div>
            <div className={`wordle-cell feedback-${guess.feedback.generation.replace('/', '-')}`}>
              {getFeedbackIcon(guess.feedback.generation)}
            </div>
          </div>
        );
      } else {
        rows.push(
          <div key={i} className="wordle-row empty">
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
            <div className="wordle-cell"></div>
          </div>
        );
      }
    }
    
    return rows;
  };

  return (
    <div className="wordle-game-page">
      <div className="wordle-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <h2>Pokemon Wordle</h2>
        <div className="guess-counter">
          Guesses: {guesses.length} / {maxGuesses}
        </div>
      </div>

      <div className="wordle-grid-container">
        <div className="wordle-grid-header">
          <div className="header-cell">Pokemon</div>
          <div className="header-cell">Type 1</div>
          <div className="header-cell">Type 2</div>
          <div className="header-cell">Stage</div>
          <div className="header-cell">Evolved</div>
          <div className="header-cell">Color</div>
          <div className="header-cell">Gen</div>
        </div>
        
        <div className="wordle-grid">
          {renderGuessGrid()}
        </div>
      </div>

      {!gameCompleted && (
        <div className="guess-input-section">
          <input
            type="text"
            className="pokemon-search"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchTerm && (
            <div className="pokemon-suggestions">
              {filteredPokemon.slice(0, 10).map(p => (
                <div
                  key={p.id}
                  className="pokemon-suggestion"
                  onClick={() => {
                    setSelectedPokemon(p);
                    setSearchTerm(capitalizeFirst(p.name));
                  }}
                >
                  {capitalizeFirst(p.name)}
                </div>
              ))}
            </div>
          )}
          
          <button
            className="submit-guess-button"
            onClick={handleSubmitGuess}
            disabled={!selectedPokemon || loading}
          >
            {loading ? 'Submitting...' : 'Submit Guess'}
          </button>
        </div>
      )}

      {gameCompleted && (
        <div className="game-result">
          <h3>{won ? '🎉 You Won!' : '😔 Game Over'}</h3>
          {answer && (
            <div className="answer-reveal">
              <p>The Pokemon was:</p>
              <div className="answer-pokemon">
                <img 
                  src={
                    offeredCards.length === 3
                      ? (offeredCards[0].imageUrlLarge || offeredCards[0].imageUrl)
                      : (answer as any).imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(answer as any).pokedexNumber ?? (answer as any).id ?? 0}.png`
                  }
                  alt={capitalizeFirst(answer.name)}
                  className="answer-card-image"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('official-artwork')) return;
                    const a = answer as any;
                    target.src = a?.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${a?.pokedexNumber ?? a?.id ?? 0}.png`;
                  }}
                />
                <h4>{capitalizeFirst(answer.name)}</h4>
              </div>
            </div>
          )}
          {tier && <p className="tier-result">Performance: Tier {tier}</p>}
          
          <div className="game-result-actions">
            {!cardCaptured && (
              <button 
                className="view-cards-button"
                onClick={async () => {
                  if (offeredCards.length === 3) {
                    onGameComplete(won, tier || 6, offeredCards);
                    return;
                  }
                  const refetch = await fetch(`http://localhost:4000/games/${gameId}`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                  });
                  if (refetch.ok) {
                    const gameData = await refetch.json();
                    if (Array.isArray(gameData.offeredCards) && gameData.offeredCards.length === 3) {
                      setOfferedCards(gameData.offeredCards);
                      onGameComplete(won, tier || 6, gameData.offeredCards);
                    } else {
                      alert('Cards are still loading. Please try again in a moment.');
                    }
                  } else {
                    alert('Failed to load cards. Please try again.');
                  }
                }}
              >
                🎴 View Your Cards
              </button>
            )}
            
            {cardCaptured && (
              <>
                <button 
                  className="play-again-button"
                  onClick={onBack}
                >
                  🎮 Play Again
                </button>
                <button 
                  className="exit-button"
                  onClick={() => window.location.href = '/'}
                >
                  🏠 Exit to Home
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
