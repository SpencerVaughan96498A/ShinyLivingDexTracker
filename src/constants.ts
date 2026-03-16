import { Generation } from './types';

export const GENERATIONS: Generation[] = [
  { id: 1, name: 'Gen I', offset: 0, limit: 151 },
  { id: 2, name: 'Gen II', offset: 151, limit: 100 },
  { id: 3, name: 'Gen III', offset: 251, limit: 135 },
  { id: 4, name: 'Gen IV', offset: 386, limit: 107 },
  { id: 5, name: 'Gen V', offset: 493, limit: 156 },
  { id: 6, name: 'Gen VI', offset: 649, limit: 72 },
  { id: 7, name: 'Gen VII', offset: 721, limit: 88 },
  { id: 8, name: 'Gen VIII', offset: 809, limit: 96 },
  { id: 9, name: 'Gen IX', offset: 905, limit: 120 },
];

export const SHINY_LOCKED = [
  'victini', 'keldeo', 'meloetta', 'hoopa', 'volcanion', 'cosmog', 'cosmoem', 
  'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal', 'melmetal-gmax', 
  'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu-single-strike', 
  'urshifu-rapid-strike', 'urshifu-single-strike-gmax', 'urshifu-rapid-strike-gmax', 
  'zarude', 'glastrier', 'spectrier', 'calyrex', 'enamorus', 'gimmighoul', 
  'gholdengo', 'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'koraidon', 
  'miraidon', 'okidogi', 'munkidori', 'fezandipiti', 'ogerpon', 'ursaluna-bloodmoon', 
  'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt', 'iron-boulder', 
  'iron-crown', 'terapagos', 'pecharunt', 'magearna-original'
];

export const GAME_SHINY_LOCKS: Record<string, string[]> = {
  'black-white': ['reshiram', 'zekrom'],
  'black2-white2': ['reshiram', 'zekrom'],
  'x-y': ['articuno', 'zapdos', 'moltres', 'mewtwo', 'xerneas', 'yveltal', 'zygarde', 'zygarde-50', 'zygarde-10', 'zygarde-complete'],
  'omega-ruby-alpha-sapphire': ['kyogre', 'groudon', 'rayquaza', 'deoxys'],
  'sun-moon': ['tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'necrozma'],
  'ultra-sun-ultra-moon': ['zygarde', 'zygarde-50', 'zygarde-10', 'zygarde-complete', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini', 'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'necrozma'],
  'sword-shield': ['zacian', 'zamazenta', 'eternatus'],
  'isle-of-armor': ['kubfu', 'urshifu-single-strike', 'urshifu-rapid-strike'],
  'crown-tundra': ['cosmog', 'cosmoem', 'poipole', 'keldeo', 'articuno-galar', 'zapdos-galar', 'moltres-galar', 'glastrier', 'spectrier', 'calyrex'],
  'brilliant-diamond-shining-pearl': ['mew', 'jirachi'],
  'legends-arceus': ['dialga', 'palkia', 'uxie', 'mesprit', 'azelf', 'heatran', 'regigigas', 'giratina', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus', 'tornadus', 'thundurus', 'landorus', 'enamorus'],
  'scarlet-violet': ['gimmighoul', 'ting-lu', 'chien-pao', 'wo-chien', 'chi-yu', 'koraidon', 'miraidon'],
  'teal-mask': ['ursaluna-bloodmoon', 'okidogi', 'munkidori', 'fezandipiti', 'ogerpon'],
  'indigo-disk': ['gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown', 'terapagos', 'pecharunt', 'meloetta', 'articuno', 'zapdos', 'moltres', 'raikou', 'suicune', 'lugia', 'ho-oh', 'entei', 'latios', 'latias', 'kyogre', 'groudon', 'rayquaza', 'cobalion', 'terrakion', 'virizion', 'reshiram', 'zekrom', 'kyurem', 'solgaleo', 'lunala', 'necrozma', 'kubfu', 'glastrier', 'spectrier'],
  'legends-za': ['xerneas', 'yveltal', 'zygarde', 'diancie', 'mewtwo']
};
