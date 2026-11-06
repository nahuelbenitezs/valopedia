// Turns valorant-api.com responses into the small shapes the site renders.
// No DOM here: the browser and scripts/update-data.mjs both use this module.

export const API_BASE = 'https://valorant-api.com/v1';
export const LANGUAGES = ['en-US', 'es-MX'];

const ABILITY_SLOTS = {
    Grenade: { key: 'C', order: 0 },
    Ability1: { key: 'Q', order: 1 },
    Ability2: { key: 'E', order: 2 },
    Ultimate: { key: 'X', order: 3 },
    Passive: { key: 'Passive', order: 4 },
};

// The API has both "Rifles" and "Assault Rifles" as shop text, so group by the
// stable enum instead. An unknown category still shows up, using its enum name.
export const WEAPON_CATEGORY_ORDER = ['Sidearm', 'SMG', 'Shotgun', 'Rifle', 'Sniper', 'Heavy', 'Melee'];

const byName = (a, b) => a.name.localeCompare(b.name, 'en');
const enumTail = (value) => (value ? String(value).split('::').pop() : null);

// Only https URLs reach an <img> or a style, whatever the source sends.
function safeUrl(value) {
    return typeof value === 'string' && value.startsWith('https://') ? value : null;
}

// Ability text carries in-game markup such as <whitebold>Wingman</>.
export function stripMarkup(text) {
    return String(text ?? '')
        .replace(/<\/?[a-zA-Z]*>/g, '')
        .replace(/\r\n?/g, '\n')
        .trim();
}

export function slugify(name) {
    return String(name).normalize('NFD').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeAbility(raw) {
    const slot = ABILITY_SLOTS[raw.slot];
    return {
        key: slot?.key ?? null,
        order: slot?.order ?? 99,
        name: raw.displayName,
        description: stripMarkup(raw.description),
        icon: safeUrl(raw.displayIcon),
    };
}

function normalizeAgent(raw) {
    return {
        id: raw.uuid,
        slug: slugify(raw.displayName),
        name: raw.displayName,
        description: stripMarkup(raw.description),
        role: {
            name: raw.role?.displayName ?? 'Unknown',
            description: stripMarkup(raw.role?.description),
            icon: safeUrl(raw.role?.displayIcon),
        },
        // displayIcon is 1024 px and about 400 KB. The 64 px minimap head is about
        // 6 KB, which is what a page showing all the agents at once can afford.
        thumb: safeUrl(raw.minimapPortrait) ?? safeUrl(raw.displayIcon),
        portrait: safeUrl(raw.fullPortrait),
        background: safeUrl(raw.background),
        gradient: (raw.backgroundGradientColors ?? [])
            .filter((color) => /^[0-9a-f]{8}$/i.test(color))
            .map((color) => `#${color}`),
        abilities: (raw.abilities ?? [])
            .map(normalizeAbility)
            .sort((a, b) => a.order - b.order)
            .map(({ order, ...ability }) => ability),
    };
}

function normalizeCallouts(callouts) {
    const regions = new Map();
    for (const { superRegionName, regionName } of callouts ?? []) {
        if (!superRegionName || !regionName) continue;
        if (!regions.has(superRegionName)) regions.set(superRegionName, new Set());
        regions.get(superRegionName).add(regionName);
    }
    return [...regions]
        .map(([region, names]) => ({ region, names: [...names].sort() }))
        .sort((a, b) => a.region.localeCompare(b.region, 'en'));
}

function normalizeMap(raw) {
    return {
        id: raw.uuid,
        slug: slugify(raw.displayName),
        name: raw.displayName,
        sites: raw.tacticalDescription ?? null,
        banner: safeUrl(raw.listViewIcon),
        splash: safeUrl(raw.splash),
        minimap: safeUrl(raw.displayIcon),
        callouts: normalizeCallouts(raw.callouts),
    };
}

function normalizeWeapon(raw) {
    const stats = raw.weaponStats;
    const category = enumTail(raw.category) ?? 'Other';
    return {
        id: raw.uuid,
        slug: slugify(raw.displayName),
        name: raw.displayName,
        category,
        cost: raw.shopData?.cost ?? null,
        icon: safeUrl(raw.displayIcon),
        stats: stats
            ? {
                fireRate: stats.fireRate,
                magazine: stats.magazineSize,
                reload: stats.reloadTimeSeconds,
                wallPenetration: enumTail(stats.wallPenetration),
                damage: (stats.damageRanges ?? []).map((range) => ({
                    from: range.rangeStartMeters,
                    to: range.rangeEndMeters,
                    head: range.headDamage,
                    body: range.bodyDamage,
                    leg: range.legDamage,
                })),
            }
            : null,
    };
}

export const COLLECTIONS = {
    agents: {
        path: (language) => `/agents?isPlayableCharacter=true&language=${language}`,
        minItems: 20,
        normalize: (data) => data
            .filter((agent) => agent.isPlayableCharacter)
            .map(normalizeAgent)
            .sort(byName),
    },
    maps: {
        path: (language) => `/maps?language=${language}`,
        minItems: 7,
        // Only real maps have a minimap. That leaves out The Range, Basic
        // Training and the Skirmish arenas.
        normalize: (data) => data
            .filter((map) => map.displayIcon)
            .map(normalizeMap)
            .sort(byName),
    },
    weapons: {
        path: (language) => `/weapons?language=${language}`,
        minItems: 15,
        normalize: (data) => data
            .map(normalizeWeapon)
            .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0) || byName(a, b)),
    },
};

// Rejects anything the pages could not render, so a broken response from the
// source never replaces good data.
export function assertValidItems(name, items) {
    const { minItems } = COLLECTIONS[name];
    if (!Array.isArray(items) || items.length < minItems) {
        throw new Error(`${name}: expected at least ${minItems} items, got ${items?.length ?? 'none'}`);
    }
    const broken = items.find((item) => !item.id || !item.name || !item.slug);
    if (broken) throw new Error(`${name}: item without id or name: ${JSON.stringify(broken).slice(0, 120)}`);
    return items;
}

async function fetchEnvelope(path, { fetchImpl = fetch, timeoutMs = 8000 } = {}) {
    const response = await fetchImpl(`${API_BASE}${path}`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    const body = await response.json();
    if (body?.data === undefined) throw new Error(`${path}: response without data`);
    return body.data;
}

export async function fetchVersion(options) {
    const data = await fetchEnvelope('/version', options);
    if (!data.version || !data.branch) throw new Error('/version: missing version fields');
    return {
        version: data.version,
        patch: data.branch.replace(/^release-/, ''),
        buildDate: data.buildDate ?? null,
    };
}

export async function fetchCollection(name, { language = LANGUAGES[0], ...options } = {}) {
    const { path, normalize } = COLLECTIONS[name];
    const data = await fetchEnvelope(path(language), options);
    return assertValidItems(name, normalize(data));
}
