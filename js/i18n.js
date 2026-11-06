// Interface text in both languages. Game text (agents, abilities, maps) comes
// translated from the data source, so it is not here. No DOM at import time:
// the tests load this module too.

export const LANGUAGES = {
    en: { api: 'en-US' },
    es: { api: 'es-MX' },
};

const STORAGE_KEY = 'valopedia-language';
const URL_PARAM = 'lang';

export const STRINGS = {
    en: {
        'title.home': 'Valopedia | VALORANT wiki',
        'title.agents': 'Agents | Valopedia',
        'title.abilities': 'Abilities | Valopedia',
        'title.maps': 'Maps | Valopedia',
        'title.weapons': 'Weapons | Valopedia',
        'description.home': 'A VALORANT fan wiki with agents, abilities, maps and weapons that stays up to date after each patch.',
        'description.agents': 'Every VALORANT agent with role and biography, updated from game data after each patch.',
        'description.abilities': 'All VALORANT agent abilities with their default keys and descriptions, updated after each patch.',
        'description.maps': 'VALORANT maps with bomb sites, minimaps and callouts, updated after each patch.',
        'description.weapons': 'VALORANT weapons with cost, fire rate, magazine and damage by range, updated after each patch.',
        'nav.home': 'Home',
        'nav.agents': 'Agents',
        'nav.abilities': 'Abilities',
        'nav.maps': 'Maps',
        'nav.weapons': 'Weapons',
        'nav.label': 'Main',
        'nav.skip': 'Skip to content',
        'nav.logo': 'Valopedia home',
        'menu.open': 'Open menu',
        'menu.close': 'Close menu',
        'language.label': 'Language',
        'hero.title': 'Every agent, ability and map, up to date',
        'hero.text': 'A VALORANT fan wiki that refreshes itself from game data after every patch.',
        'hero.cta': 'Learn Agents',
        'footer.source': 'Game data from {source}, an unofficial fan project.',
        'footer.legal': 'Riot Games legal',
        'status.current': 'Up to date with patch {patch}.',
        'status.live': 'Showing patch {patch} directly from the data source.',
        'status.saved': 'The data source is unavailable, so this is a saved copy{detail} and may be out of date.',
        'status.patch': 'patch {patch}',
        'status.date': 'saved {date}',
        'status.down': 'The data source is unavailable right now.',
        'loading': 'Loading {label}',
        'error.title': "Couldn't load {label}",
        'error.text': 'The data source and the saved copy are both unavailable. Check your connection and try again.',
        'error.retry': 'Try again',
        'label.agents': 'agents',
        'label.abilities': 'abilities',
        'label.maps': 'maps',
        'label.weapons': 'weapons',
        'agents.choose': 'Choose an agent',
        'agents.previous': 'Previous agent',
        'agents.next': 'Next agent',
        'agents.portrait': '{name} portrait',
        'abilities.title': 'Abilities',
        'abilities.jump': 'Jump to an agent',
        'abilities.defaultKey': 'Default key',
        'abilities.passive': 'Passive',
        'maps.title': 'Maps',
        'maps.competitive': 'Competitive maps',
        'maps.other': 'Other game modes',
        'maps.details': 'Minimap and {count} callouts',
        'maps.minimap': '{name} minimap',
        'weapons.title': 'Weapons',
        'weapons.cost': 'Cost',
        'weapons.magazine': 'Magazine',
        'weapons.fireRate': 'Fire rate',
        'weapons.reload': 'Reload',
        'weapons.penetration': 'Wall penetration',
        'weapons.range': 'Range',
        'weapons.head': 'Head',
        'weapons.body': 'Body',
        'weapons.leg': 'Leg',
        'weapons.damage': '{name} damage by range',
        'category.Sidearm': 'Sidearms',
        'category.SMG': 'SMGs',
        'category.Shotgun': 'Shotguns',
        'category.Rifle': 'Rifles',
        'category.Sniper': 'Sniper Rifles',
        'category.Heavy': 'Heavy Weapons',
        'category.Melee': 'Melee',
        'penetration.Low': 'Low',
        'penetration.Medium': 'Medium',
        'penetration.High': 'High',
    },
    es: {
        'title.home': 'Valopedia | Wiki de VALORANT',
        'title.agents': 'Agentes | Valopedia',
        'title.abilities': 'Habilidades | Valopedia',
        'title.maps': 'Mapas | Valopedia',
        'title.weapons': 'Armas | Valopedia',
        'description.home': 'Una wiki de VALORANT hecha por fans, con agentes, habilidades, mapas y armas que se mantiene al día después de cada parche.',
        'description.agents': 'Todos los agentes de VALORANT con su rol y biografía, actualizados con los datos del juego después de cada parche.',
        'description.abilities': 'Todas las habilidades de los agentes de VALORANT, con su tecla predeterminada y su descripción, actualizadas después de cada parche.',
        'description.maps': 'Mapas de VALORANT con sitios de bomba, minimapas y nombres de zonas, actualizados después de cada parche.',
        'description.weapons': 'Armas de VALORANT con precio, cadencia, cargador y daño por distancia, actualizadas después de cada parche.',
        'nav.home': 'Inicio',
        'nav.agents': 'Agentes',
        'nav.abilities': 'Habilidades',
        'nav.maps': 'Mapas',
        'nav.weapons': 'Armas',
        'nav.label': 'Principal',
        'nav.skip': 'Saltar al contenido',
        'nav.logo': 'Inicio de Valopedia',
        'menu.open': 'Abrir menú',
        'menu.close': 'Cerrar menú',
        'language.label': 'Idioma',
        'hero.title': 'Todos los agentes, habilidades y mapas, al día',
        'hero.text': 'Una wiki de VALORANT hecha por fans que se actualiza sola con los datos del juego después de cada parche.',
        'hero.cta': 'Conocer agentes',
        'footer.source': 'Datos del juego de {source}, un proyecto de fans no oficial.',
        'footer.legal': 'Información legal de Riot Games',
        'status.current': 'Al día con el parche {patch}.',
        'status.live': 'Mostrando el parche {patch} directo de la fuente de datos.',
        'status.saved': 'La fuente de datos no está disponible, así que esta es una copia guardada{detail} y puede estar desactualizada.',
        'status.patch': 'parche {patch}',
        'status.date': 'guardada el {date}',
        'status.down': 'La fuente de datos no está disponible en este momento.',
        'loading': 'Cargando {label}',
        'error.title': 'No se pudieron cargar {label}',
        'error.text': 'La fuente de datos y la copia guardada no están disponibles. Revisá tu conexión y volvé a intentar.',
        'error.retry': 'Reintentar',
        'label.agents': 'los agentes',
        'label.abilities': 'las habilidades',
        'label.maps': 'los mapas',
        'label.weapons': 'las armas',
        'agents.choose': 'Elegí un agente',
        'agents.previous': 'Agente anterior',
        'agents.next': 'Agente siguiente',
        'agents.portrait': 'Retrato de {name}',
        'abilities.title': 'Habilidades',
        'abilities.jump': 'Ir a un agente',
        'abilities.defaultKey': 'Tecla predeterminada',
        'abilities.passive': 'Pasiva',
        'maps.title': 'Mapas',
        'maps.competitive': 'Mapas competitivos',
        'maps.other': 'Otros modos de juego',
        'maps.details': 'Minimapa y {count} zonas',
        'maps.minimap': 'Minimapa de {name}',
        'weapons.title': 'Armas',
        'weapons.cost': 'Precio',
        'weapons.magazine': 'Cargador',
        'weapons.fireRate': 'Cadencia',
        'weapons.reload': 'Recarga',
        'weapons.penetration': 'Penetración de paredes',
        'weapons.range': 'Distancia',
        'weapons.head': 'Cabeza',
        'weapons.body': 'Cuerpo',
        'weapons.leg': 'Pierna',
        'weapons.damage': 'Daño de {name} por distancia',
        'category.Sidearm': 'Pistolas',
        'category.SMG': 'Subfusiles',
        'category.Shotgun': 'Escopetas',
        'category.Rifle': 'Rifles',
        'category.Sniper': 'Francotiradores',
        'category.Heavy': 'Armas pesadas',
        'category.Melee': 'Cuerpo a cuerpo',
        'penetration.Low': 'Baja',
        'penetration.Medium': 'Media',
        'penetration.High': 'Alta',
    },
};

function storedLanguage() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null; // Storage can be blocked. See setLanguage.
    }
}

function urlLanguage() {
    return new URLSearchParams(globalThis.location?.search ?? '').get(URL_PARAM);
}

// Explicit choice first, then the browser's language, then English.
export function currentLanguage() {
    for (const chosen of [urlLanguage(), storedLanguage()]) {
        if (chosen && LANGUAGES[chosen]) return chosen;
    }
    return globalThis.navigator?.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

// Returns the address to load. With storage blocked the choice goes in the URL,
// so the switch still works on this page even though it can't persist.
export function setLanguage(language) {
    const url = new URL(location.href);
    url.searchParams.delete(URL_PARAM);
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        url.searchParams.set(URL_PARAM, language);
    }
    return url.href;
}

export function apiLanguage() {
    return LANGUAGES[currentLanguage()].api;
}

export function t(key, values = {}) {
    const text = STRINGS[currentLanguage()][key] ?? STRINGS.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

// For a value the source may add later, such as a new weapon category.
export function tOr(key, fallback) {
    return STRINGS[currentLanguage()][key] ?? fallback;
}
