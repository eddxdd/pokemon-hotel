/**
 * PokeAPI Service
 * Fetches Pokemon data from PokeAPI v2
 */

import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokeApiPokemon {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
      };
    };
  };
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  color: {
    name: string;
  };
  generation: {
    name: string; // "generation-i", etc.
  };
  evolution_chain: {
    url: string;
  };
}

export interface PokeApiEvolutionChain {
  chain: {
    species: {
      name: string;
    };
    evolves_to: Array<{
      species: {
        name: string;
      };
      evolves_to: Array<{
        species: {
          name: string;
        };
      }>;
    }>;
  };
}

export interface ProcessedPokemonData {
  name: string;
  pokedexNumber: number;
  type1: string;
  type2: string | null;
  evolutionStage: number;
  fullyEvolved: boolean;
  color: string;
  generation: number;
  imageUrl: string;
}

/**
 * Fetch Pokemon data from PokeAPI
 */
export async function fetchPokemon(idOrName: string | number): Promise<PokeApiPokemon> {
  const response = await axios.get<PokeApiPokemon>(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);
  return response.data;
}

/**
 * Fetch Pokemon species data (includes color, generation, evolution chain)
 */
export async function fetchPokemonSpecies(idOrName: string | number): Promise<PokeApiSpecies> {
  const response = await axios.get<PokeApiSpecies>(`${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`);
  return response.data;
}

/**
 * Fetch evolution chain data
 */
export async function fetchEvolutionChain(url: string): Promise<PokeApiEvolutionChain> {
  const response = await axios.get<PokeApiEvolutionChain>(url);
  return response.data;
}

/**
 * Calculate evolution stage and if Pokemon is fully evolved
 */
function calculateEvolutionData(
  pokemonName: string,
  evolutionChain: PokeApiEvolutionChain
): { evolutionStage: number; fullyEvolved: boolean } {
  const chain = evolutionChain.chain;
  
  // Stage 1 - Base form
  if (chain.species.name === pokemonName) {
    return {
      evolutionStage: 1,
      fullyEvolved: chain.evolves_to.length === 0
    };
  }
  
  // Stage 2 - First evolution
  for (const evo1 of chain.evolves_to) {
    if (evo1.species.name === pokemonName) {
      return {
        evolutionStage: 2,
        fullyEvolved: evo1.evolves_to.length === 0
      };
    }
    
    // Stage 3 - Second evolution
    for (const evo2 of evo1.evolves_to) {
      if (evo2.species.name === pokemonName) {
        return {
          evolutionStage: 3,
          fullyEvolved: true // Stage 3 is always fully evolved
        };
      }
    }
  }
  
  // Default to stage 1, fully evolved (for Pokemon without evolutions)
  return { evolutionStage: 1, fullyEvolved: true };
}

/**
 * Extract generation number from generation name
 */
function extractGenerationNumber(generationName: string): number {
  const romanNumerals: Record<string, number> = {
    'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
    'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9
  };
  
  const match = generationName.match(/generation-([ivx]+)/i);
  if (match && match[1]) {
    return romanNumerals[match[1].toLowerCase()] || 1;
  }
  
  return 1;
}

/**
 * Fetch and process complete Pokemon data
 */
export async function fetchCompletePokemonData(idOrName: string | number): Promise<ProcessedPokemonData> {
  try {
    // Fetch pokemon and species data in parallel
    const [pokemon, species] = await Promise.all([
      fetchPokemon(idOrName),
      fetchPokemonSpecies(idOrName)
    ]);
    
    // Fetch evolution chain
    const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url);
    
    // Calculate evolution data
    const { evolutionStage, fullyEvolved } = calculateEvolutionData(pokemon.name, evolutionChain);
    
    // Extract types
    const types = pokemon.types.sort((a, b) => a.slot - b.slot);
    const type1 = types[0]?.type.name || 'normal';
    const type2 = types[1]?.type.name || null;
    
    // Get best quality image
    const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default 
      || pokemon.sprites.front_default 
      || '';
    
    return {
      name: pokemon.name,
      pokedexNumber: pokemon.id,
      type1: capitalizeFirst(type1),
      type2: type2 ? capitalizeFirst(type2) : null,
      evolutionStage,
      fullyEvolved,
      color: capitalizeFirst(species.color.name),
      generation: extractGenerationNumber(species.generation.name),
      imageUrl
    };
  } catch (error) {
    console.error(`Error fetching Pokemon data for ${idOrName}:`, error);
    throw error;
  }
}

/**
 * Fetch multiple Pokemon in batch with delay to respect rate limits
 */
export async function fetchPokemonBatch(
  ids: number[],
  delayMs: number = 100
): Promise<ProcessedPokemonData[]> {
  const results: ProcessedPokemonData[] = [];
  
  for (const id of ids) {
    try {
      const data = await fetchCompletePokemonData(id);
      results.push(data);
      
      // Delay to respect rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to fetch Pokemon ${id}, skipping...`);
    }
  }
  
  return results;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
