export interface Pokemon {
  id: number;
  name: string;
  rawName: string;
  sprite: string;
  shinySprite: string;
}

export interface Generation {
  id: number;
  name: string;
  offset: number;
  limit: number;
}

export interface CaughtPokemon {
  pokemonId: number;
  caught: boolean;
  updatedAt: string;
}
