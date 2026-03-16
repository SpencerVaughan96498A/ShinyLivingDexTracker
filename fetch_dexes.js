async function getPokedexIds(pokedexName) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexName}/`);
    const data = await res.json();
    const ids = data.pokemon_entries.map(entry => {
      const parts = entry.pokemon_species.url.split('/');
      return parseInt(parts[parts.length - 2]);
    });
    return [...new Set(ids)].sort((a, b) => a - b);
  } catch (e) {
    console.error(`Error fetching ${pokedexName}:`, e.message);
    return [];
  }
}

async function run() {
  const dexes = {
    'galar': await getPokedexIds('galar'),
    'armor': await getPokedexIds('isle-of-armor'),
    'tundra': await getPokedexIds('crown-tundra'),
    'hisui': await getPokedexIds('hisui'),
    'paldea': await getPokedexIds('paldea'),
    'kitakami': await getPokedexIds('kitakami'),
    'blueberry': await getPokedexIds('blueberry')
  };
  
  // Cumulative logic
  const swsh_base = dexes.galar;
  const swsh_armor = [...new Set([...swsh_base, ...dexes.armor])].sort((a, b) => a - b);
  const swsh_tundra = [...new Set([...swsh_armor, ...dexes.tundra])].sort((a, b) => a - b);
  
  const sv_base = dexes.paldea;
  const sv_teal = [...new Set([...sv_base, ...dexes.kitakami])].sort((a, b) => a - b);
  const sv_indigo = [...new Set([...sv_teal, ...dexes.blueberry])].sort((a, b) => a - b);
  
  console.log('SWSH_BASE:', JSON.stringify(swsh_base));
  console.log('SWSH_ARMOR:', JSON.stringify(swsh_armor));
  console.log('SWSH_TUNDRA:', JSON.stringify(swsh_tundra));
  console.log('HISUI:', JSON.stringify(dexes.hisui));
  console.log('SV_BASE:', JSON.stringify(sv_base));
  console.log('SV_TEAL:', JSON.stringify(sv_teal));
  console.log('SV_INDIGO:', JSON.stringify(sv_indigo));
}

run();
