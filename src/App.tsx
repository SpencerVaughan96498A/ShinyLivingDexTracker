/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import app, { auth } from './firebase';
import { GENERATIONS, SHINY_LOCKED, GAME_SHINY_LOCKS } from './constants';
import { Pokemon } from './types';
import { LogIn, LogOut, ChevronDown, ChevronUp, Lock, Sparkles, Footprints, Search, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FORM_SECTIONS = [
  { id: 100, name: 'Alolan Forms', pattern: '-alola' },
  { id: 101, name: 'Galarian Forms', pattern: '-galar' },
  { id: 102, name: 'Hisuian Forms', pattern: '-hisui' },
  { id: 103, name: 'Paldean Forms', pattern: '-paldea' },
  { id: 104, name: 'Gigantamax Forms', pattern: '-gmax' }
];

const SECTION_GRADIENTS: Record<number, string> = {
  1: 'linear-gradient(to right, #FF0000 0% 40%, #0000FF 60% 100%)', // Red vs Blue
  2: 'linear-gradient(to right, #D4AF37 0% 40%, #C0C0C0 60% 100%)', // Gold vs Silver
  3: 'linear-gradient(to right, #A00000 0% 40%, #0000A0 60% 100%)', // Ruby vs Sapphire
  4: 'linear-gradient(to right, #AAAAFF 0% 40%, #FFC0CB 60% 100%)', // Diamond vs Pearl
  5: 'linear-gradient(to right, #444444 0% 40%, #FFFFFF 60% 100%)', // Black vs White
  6: 'linear-gradient(to right, #0659BB 0% 40%, #F50205 60% 100%)', // X vs Y
  7: 'linear-gradient(to right, #F1912B 0% 40%, #67549C 60% 100%)', // Sun vs Moon
  8: 'linear-gradient(to right, #00A1E9 0% 40%, #E6007E 60% 100%)', // Sword vs Shield
  9: 'linear-gradient(to right, #FF2400 0% 40%, #8F00FF 60% 100%)', // Scarlet vs Violet
  100: 'linear-gradient(to right, #E95B33 0% 40%, #72328E 60% 100%)', // Ultra Sun vs Ultra Moon
  101: 'linear-gradient(to right, #F5D547 0% 40%, #00A5E3 60% 100%)', // Isle of Armor vs Crown Tundra
  102: 'linear-gradient(to right, #1B2C5B 0% 40%, #D4AF37 60% 100%)', // Legends Arceus
  103: 'linear-gradient(to right, #008B8B 0% 40%, #4B0082 60% 100%)', // Teal Mask vs Indigo Disk
  104: 'linear-gradient(to right, #E91E63 0% 40%, #673AB7 60% 100%)', // Gigantamax
};

const GAME_DEXES: Record<string, number[]> = {
  // Gen 1
  'red-blue-yellow': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151],
  
  // Gen 2
  'gold-silver-crystal': Array.from({ length: 251 }, (_, i) => i + 1),

  // Gen 3
  'ruby-sapphire-emerald': Array.from({ length: 386 }, (_, i) => i + 1),
  'firered-leafgreen': Array.from({ length: 151 }, (_, i) => i + 1),

  // Gen 4
  'diamond-pearl-platinum': Array.from({ length: 493 }, (_, i) => i + 1),
  'heartgold-soulsilver': Array.from({ length: 493 }, (_, i) => i + 1),
  'brilliant-diamond-shining-pearl': Array.from({ length: 493 }, (_, i) => i + 1),

  // Gen 5
  'black-white': Array.from({ length: 649 }, (_, i) => i + 1),
  'black2-white2': Array.from({ length: 649 }, (_, i) => i + 1),

  // Gen 6
  'x-y': Array.from({ length: 721 }, (_, i) => i + 1),
  'omega-ruby-alpha-sapphire': Array.from({ length: 721 }, (_, i) => i + 1),

  // Gen 7
  'sun-moon': Array.from({ length: 802 }, (_, i) => i + 1),
  'ultra-sun-ultra-moon': Array.from({ length: 807 }, (_, i) => i + 1),
  'lgpe': Array.from({ length: 151 }, (_, i) => i + 1).concat([808, 809]),

  // Gen 8
  'sword-shield': Array.from({ length: 898 }, (_, i) => i + 1),
  'isle-of-armor': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 891, 892],
  'crown-tundra': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 894, 895, 896, 897, 898],
  'legends-arceus': Array.from({ length: 242 }, (_, i) => i + 1), // Simplified for now

  // Gen 9
  'scarlet-violet': Array.from({ length: 1025 }, (_, i) => i + 1),
  'teal-mask': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 1011, 1012, 1013, 1014, 1015, 1016, 1017],
  'indigo-disk': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025],
  'legends-za': [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 18, 23, 24, 25, 26, 35, 36, 63, 64, 65, 66, 67, 68, 69, 70, 71, 79, 80, 92, 93, 94, 95, 115, 120, 121, 123, 127, 129, 130, 133, 134, 135, 136, 142, 147, 148, 149, 150, 152, 153, 154, 158, 159, 160, 167, 168, 172, 173, 179, 180, 181, 196, 197, 199, 208, 212, 214, 225, 227, 228, 229, 246, 247, 248, 280, 281, 282, 302, 303, 304, 305, 306, 307, 308, 309, 310, 315, 318, 319, 322, 323, 333, 334, 353, 354, 359, 361, 362, 371, 372, 373, 374, 375, 376, 406, 407, 427, 428, 443, 444, 445, 447, 448, 449, 450, 459, 460, 470, 471, 475, 478, 498, 499, 500, 504, 505, 511, 512, 513, 514, 515, 516, 529, 530, 531, 543, 544, 545, 551, 552, 553, 559, 560, 568, 569, 582, 583, 584, 587, 602, 603, 604, 607, 608, 609, 618, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 780, 870
  ],
};

export default function App() {
  return (
    <ShinyDexApp />
  );
}

// No demo IDs for production
const DEMO_IDS: number[] = [];

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function ShinyDexApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPokemon, setAllPokemon] = useState<Record<number, Pokemon[]>>({});
  const [caughtMap, setCaughtMap] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(true);
  const [collapsedGens, setCollapsedGens] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    GENERATIONS.forEach(g => initial[g.id] = true);
    FORM_SECTIONS.forEach(s => initial[s.id] = true);
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('all');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Caught Pokemon from MongoDB
  useEffect(() => {
    const fetchCaught = async () => {
      if (!user) {
        setCaughtMap({});
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/caught/${user.uid}`);
        const data = await response.json();
        const map: Record<string, boolean> = {};
        if (data && data.caughtNames && Array.isArray(data.caughtNames)) {
          data.caughtNames.forEach((name: string) => map[name] = true);
        }
        setCaughtMap(map);
      } catch (error) {
        console.error("Error fetching caught names:", error);
      }
    };

    fetchCaught();
  }, [user]);

  // Fetch ALL Pokemon including Forms
  useEffect(() => {
    const fetchAll = async () => {
      // Try to load from cache first
      const cachedData = localStorage.getItem('pokemon_data_cache');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setAllPokemon(parsed);
          setFetching(false);
          console.log("Loaded Pokemon data from cache");
          // We still fetch in the background to keep it fresh, but we don't block the UI
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }

      setFetching(true);
      console.log("Starting Pokemon fetch...");
      try {
        // 1. Fetch Generations
        const genData = await Promise.all(GENERATIONS.map(async (gen) => {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?offset=${gen.offset}&limit=${gen.limit}`
          );
          const data = await response.json();
          
          const pokemon = data.results.map((p: any) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop()!);
            const rawName = p.name.toLowerCase();
            return {
              id,
              rawName,
              name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' '),
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
              shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
            };
          });
          return { id: gen.id, pokemon };
        }));

        // 2. Fetch Varieties for Forms
        console.log("Fetching varieties from pokemon endpoint...");
        // We use the main pokemon endpoint with a high limit to get varieties (10001+)
        const varietyResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=3000`);
        const varietyData = await varietyResponse.json();
        console.log(`Total Pokemon entries fetched: ${varietyData.results.length}`);
        
        const formSectionsData = FORM_SECTIONS.map(section => {
          const pattern = section.pattern;
          const filtered = varietyData.results.filter((p: any) => {
            const name = p.name.toLowerCase();
            const id = parseInt(p.url.split('/').filter(Boolean).pop()!);
            
            // Regional forms and GMAX are always in the 10000+ range in the /pokemon endpoint
            if (id < 10000) return false;

            // Exclusions
            if (name === 'raticate-totem-alola' || name === 'pikachu-alola-cap') return false;
            if (name === 'darmanitan-galar-zen') return false;
            if (name === 'toxtricity-low-key-gmax') return false;

            // Use includes to capture forms that might have additional suffixes (like Tauros breeds)
            return name.includes(pattern);
          });

          console.log(`Section ${section.name}: found ${filtered.length} matches`);

          const pokemon = filtered.map((p: any) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop()!);
            const rawName = p.name.toLowerCase();
            return {
              id,
              rawName,
              name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' '),
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
              shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
            };
          });

          return { id: section.id, pokemon };
        });

        const newAllPokemon: Record<number, Pokemon[]> = {};
        [...genData, ...formSectionsData].forEach(item => {
          if (item.pokemon.length > 0) {
            newAllPokemon[item.id] = item.pokemon;
          }
        });
        setAllPokemon(newAllPokemon);
        localStorage.setItem('pokemon_data_cache', JSON.stringify(newAllPokemon));
      } catch (error) {
        console.error("Error fetching pokemon:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchAll();
  }, []);

  const toggleCaught = async (pokemon: Pokemon) => {
    // Optimistic Update
    setCaughtMap(prev => ({
      ...prev,
      [pokemon.name]: !prev[pokemon.name]
    }));

    if (!user) return;

    try {
      await fetch(`${API_BASE_URL}/api/caught/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonName: pokemon.name })
      });
    } catch (error) {
      console.error("Error updating caught status:", error);
      // Rollback on error
      setCaughtMap(prev => ({
        ...prev,
        [pokemon.name]: !prev[pokemon.name]
      }));
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
      } else if (error.code === 'auth/unauthorized-domain') {
        console.error("Unauthorized Domain: You need to add 'localhost' to your Firebase project's authorized domains.");
        alert("Login failed: This domain (localhost) is not authorized in your Firebase project settings. Please add 'localhost' to the 'Authorized domains' list in the Firebase Console.");
      } else {
        console.error("Authentication error:", error.code, error.message);
        alert(`Login error: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const toggleGenCollapse = (genId: number) => {
    setCollapsedGens(prev => ({ ...prev, [genId]: !prev[genId] }));
  };

  const filteredPokemonData = useMemo(() => {
    const filtered: Record<number, Pokemon[]> = {};
    const dexIds = selectedGame !== 'all' ? GAME_DEXES[selectedGame] : null;

    Object.entries(allPokemon).forEach(([genId, list]) => {
      const filteredList = (list as Pokemon[]).filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.id.toString().includes(searchQuery);
        const matchesGame = !dexIds || dexIds.includes(p.id);
        return matchesSearch && matchesGame;
      });

      if (filteredList.length > 0) {
        filtered[parseInt(genId)] = filteredList;
      }
    });
    return filtered;
  }, [allPokemon, searchQuery, selectedGame]);

  const globalStats = useMemo(() => {
    let total = 0;
    let caught = 0;
    Object.values(filteredPokemonData).forEach((list: Pokemon[]) => {
      total += list.length;
      list.forEach(p => {
        if (caughtMap[p.name]) caught++;
      });
    });
    return { total, caught, percentage: total > 0 ? Math.round((caught / total) * 100) : 0 };
  }, [filteredPokemonData, caughtMap]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#78c850] font-pixel text-white space-y-4">
        <div className="w-16 h-16 border-8 border-white border-t-transparent rounded-full animate-spin" />
        <div className="animate-pulse">LOADING POKEDEX...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-pixel bg-gray-100">
      {/* Ultra Compact Header */}
      <header className="bg-white border-b-2 border-black p-2 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16 md:h-20">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Sparkles size={18} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
          </div>
          <h1 className="text-xs md:text-lg uppercase font-bold tracking-tight">Shiny Living Dex Tracker</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="w-32 md:w-64 h-4 md:h-6 bg-gray-200 border-2 border-black relative overflow-hidden">
              <div 
                className="h-full bg-yellow-400 border-r-2 border-black/20" 
                style={{ width: `${globalStats.percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center mix-blend-difference text-white text-[8px] md:text-xs font-bold">
                {globalStats.percentage}%
              </div>
            </div>
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-gray-600">
              {globalStats.caught} / {globalStats.total} CAUGHT
            </span>
          </div>
          {user ? (
            <button 
              onClick={handleLogout}
              className="pixel-button text-[10px] md:text-xs px-3 py-1.5 flex items-center gap-2 bg-red-100"
              title="Logout"
            >
              <Footprints size={14} />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="pixel-button text-[10px] md:text-xs px-3 py-1.5 bg-blue-600 text-white border-2 border-black flex items-center gap-2 hover:bg-blue-700 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <LogIn size={14} className="text-white" />
              <span className="font-bold">LOGIN</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content - Ultra Dense */}
      <main className="flex-1 p-2 overflow-x-hidden bg-gray-200">
        <div className="max-w-[1600px] mx-auto space-y-4">
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-2 bg-white border-2 border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="SEARCH POKEMON..."
                className="w-full bg-gray-100 border-2 border-black py-2 pl-10 pr-4 text-xs uppercase focus:outline-none focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const all: Record<number, boolean> = {};
                  [...GENERATIONS, ...FORM_SECTIONS].forEach(s => all[s.id] = false);
                  setCollapsedGens(all);
                }}
                className="pixel-button text-[10px] px-3 py-2 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
              >
                EXPAND ALL
              </button>
              <button 
                onClick={() => {
                  const all: Record<number, boolean> = {};
                  [...GENERATIONS, ...FORM_SECTIONS].forEach(s => all[s.id] = true);
                  setCollapsedGens(all);
                }}
                className="pixel-button text-[10px] px-3 py-2 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
              >
                COLLAPSE ALL
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full bg-gray-100 border-2 border-black py-2 pl-10 pr-8 text-xs uppercase appearance-none focus:outline-none focus:bg-white transition-all cursor-pointer"
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                >
                  <option value="all">ALL POKEMON</option>
                  <optgroup label="GEN 1">
                    <option value="red-blue-yellow">RED / BLUE / YELLOW</option>
                  </optgroup>
                  <optgroup label="GEN 2">
                    <option value="gold-silver-crystal">GOLD / SILVER / CRYSTAL</option>
                  </optgroup>
                  <optgroup label="GEN 3">
                    <option value="ruby-sapphire-emerald">RUBY / SAPPHIRE / EMERALD</option>
                    <option value="firered-leafgreen">FIRE RED / LEAF GREEN</option>
                  </optgroup>
                  <optgroup label="GEN 4">
                    <option value="diamond-pearl-platinum">DIAMOND / PEARL / PLATINUM</option>
                    <option value="heartgold-soulsilver">HEART GOLD / SOUL SILVER</option>
                  </optgroup>
                  <optgroup label="GEN 5">
                    <option value="black-white">BLACK / WHITE</option>
                    <option value="black2-white2">BLACK 2 / WHITE 2</option>
                  </optgroup>
                  <optgroup label="GEN 6">
                    <option value="x-y">X / Y</option>
                    <option value="omega-ruby-alpha-sapphire">OMEGA RUBY / ALPHA SAPPHIRE</option>
                  </optgroup>
                  <optgroup label="GEN 7">
                    <option value="sun-moon">SUN / MOON</option>
                    <option value="ultra-sun-ultra-moon">ULTRA SUN / ULTRA MOON</option>
                    <option value="lgpe">LET'S GO PIKACHU/EEVEE</option>
                  </optgroup>
                  <optgroup label="GEN 8">
                    <option value="sword-shield">SWORD / SHIELD</option>
                    <option value="isle-of-armor">ISLE OF ARMOR DLC</option>
                    <option value="crown-tundra">CROWN TUNDRA DLC</option>
                    <option value="brilliant-diamond-shining-pearl">BRILLIANT DIAMOND / SHINING PEARL</option>
                    <option value="legends-arceus">POKEMON LEGENDS: ARCEUS</option>
                  </optgroup>
                  <optgroup label="GEN 9">
                    <option value="scarlet-violet">SCARLET / VIOLET</option>
                    <option value="teal-mask">TEAL MASK DLC</option>
                    <option value="indigo-disk">INDIGO DISK DLC</option>
                    <option value="legends-za">POKEMON LEGENDS: Z-A</option>
                  </optgroup>
                </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {[...GENERATIONS, ...FORM_SECTIONS].map((section) => {
            const pokemonInSection = filteredPokemonData[section.id] || [];
            const totalInSection = allPokemon[section.id]?.length || 0;
            const hiddenCount = totalInSection - pokemonInSection.length;
            const caughtInSection = pokemonInSection.filter(p => caughtMap[p.name]).length;
            const progressPercentage = pokemonInSection.length > 0 ? Math.round((caughtInSection / pokemonInSection.length) * 100) : 0;
            const isCollapsed = collapsedGens[section.id];

            if (pokemonInSection.length === 0) return null;

            return (
              <section key={section.id} className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] overflow-hidden">
                <div 
                  className="relative h-10 md:h-12 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                  onClick={() => toggleGenCollapse(section.id)}
                >
                  {/* Progress Bar Background */}
                  <div className="absolute inset-0 bg-blue-800" />
                  <div 
                    className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 border-r-2 border-black/20"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  
                  <div className="relative z-10 flex items-center gap-4 px-4 w-full justify-between text-white">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xs md:text-sm uppercase font-bold tracking-widest drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                        {section.name}
                      </h2>
                      <div className="bg-black/40 px-2 py-1 border border-white/20 rounded text-[10px] md:text-xs font-bold flex items-center gap-2">
                        <span>{caughtInSection} / {pokemonInSection.length} ({progressPercentage}%)</span>
                        {hiddenCount > 0 && (
                          <span className="text-zinc-400 border-l border-white/20 pl-2">
                            {hiddenCount} HIDDEN
                          </span>
                        )}
                      </div>
                    </div>
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </div>
                </div>

                {!isCollapsed && (
                  <div 
                    className="p-2 flex flex-wrap gap-1 justify-center relative min-h-[100px]"
                    style={{ 
                      background: `${SECTION_GRADIENTS[section.id]}`,
                    }}
                  >
                    {/* Subtle Overlay to keep sprites readable */}
                    <div className="absolute inset-0 bg-white/60 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-wrap gap-1 justify-center">
                      {pokemonInSection.map((pokemon) => {
                        const isCaught = caughtMap[pokemon.name];
                        const isPermanentLock = SHINY_LOCKED.includes(pokemon.rawName);
                        const isGameLock = selectedGame !== 'all' && (
                          GAME_SHINY_LOCKS[selectedGame]?.includes(pokemon.rawName) ||
                          (pokemon.rawName.startsWith('zygarde') && GAME_SHINY_LOCKS[selectedGame]?.includes('zygarde'))
                        );
                        const isShinyLocked = isPermanentLock || isGameLock;
                        
                        return (
                          <button
                            key={pokemon.name}
                            onClick={() => toggleCaught(pokemon)}
                            title={`#${pokemon.id} ${pokemon.name}${isShinyLocked ? ' (Shiny Locked)' : ''}`}
                            className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 border-2 border-black/20 flex items-center justify-center transition-all relative group overflow-hidden",
                              isCaught ? "bg-white/40 border-white/60 shadow-inner" : "bg-black/10 hover:bg-black/20"
                            )}
                          >
                            <img 
                              src={pokemon.shinySprite} 
                              alt={pokemon.name}
                              loading="lazy"
                              className={cn(
                                "w-full h-full object-contain scale-110 transition-transform group-hover:scale-125",
                                !isCaught && "silhouette opacity-40"
                              )}
                              referrerPolicy="no-referrer"
                            />
                            {isShinyLocked && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                <Lock 
                                  size={24} 
                                  strokeWidth={3} 
                                  className={cn(
                                    "drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]",
                                    isPermanentLock ? "text-red-600/90" : "text-amber-600/90"
                                  )} 
                                />
                              </div>
                            )}
                          
                          {/* Minimal indicator */}
                          {isCaught && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 border border-black rounded-full shadow-sm" />
                          )}

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50">
                            <div className="bg-black text-white text-[6px] p-1 px-2 whitespace-nowrap uppercase border border-white shadow-xl">
                              #{pokemon.id} {pokemon.name}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t-2 border-black p-1 text-center text-[6px] uppercase opacity-60">
        <p>Shiny Dex • Icons Mode • PokéAPI</p>
      </footer>
    </div>
  );
}
