import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { loadCollection, loadSummary, STATUS } from '../js/loader.js';
import { LANGUAGES, STRINGS } from '../js/i18n.js';
import { COLLECTIONS, slugify, stripMarkup } from '../js/valorant-data.js';
import { updateData } from '../scripts/update-data.mjs';

const rawAgent = (name) => ({
    uuid: `id-${name}`,
    displayName: name,
    description: 'Bio',
    isPlayableCharacter: true,
    displayIcon: 'https://media.example/icon.png',
    minimapPortrait: 'https://media.example/small.png',
    fullPortrait: 'http://insecure.example/portrait.png',
    background: null,
    backgroundGradientColors: ['371c5cff', 'url(evil)'],
    role: { displayName: 'Duelist', description: 'Role', displayIcon: null },
    abilities: [
        { slot: 'Ultimate', displayName: 'Ult', description: 'Big', displayIcon: null },
        { slot: 'Grenade', displayName: 'Gren', description: '<whitebold>Throw</> it.\r\n\r\nTwice.', displayIcon: 'https://media.example/a.png' },
    ],
});
const rawMap = (name, withMinimap = true) => ({
    uuid: `id-${name}`,
    displayName: name,
    tacticalDescription: 'A/B Sites',
    displayIcon: withMinimap ? 'https://media.example/map.png' : null,
    listViewIcon: 'https://media.example/list.png',
    splash: 'https://media.example/splash.png',
    callouts: [
        { superRegionName: 'B', regionName: 'Main' },
        { superRegionName: 'A', regionName: 'Tree' },
        { superRegionName: 'A', regionName: 'Lobby' },
        { superRegionName: 'A', regionName: 'Tree' },
    ],
});
const rawWeapon = (name) => ({
    uuid: `id-${name}`,
    displayName: name,
    category: 'EEquippableCategory::Rifle',
    displayIcon: 'https://media.example/w.png',
    shopData: { cost: 100 },
    weaponStats: {
        fireRate: 10,
        magazineSize: 25,
        reloadTimeSeconds: 2.5,
        wallPenetration: 'EWallPenetrationDisplayType::Medium',
        damageRanges: [{ rangeStartMeters: 0, rangeEndMeters: 50, headDamage: 160, bodyDamage: 40, legDamage: 34 }],
    },
});
const names = (count) => Array.from({ length: count }, (_, i) => `N${String(i).padStart(2, '0')}`);

const liveData = {
    '/version': { version: '13.09.00.1', branch: 'release-13.09', buildDate: '2026-10-28T00:00:00Z' },
    '/agents': names(25).map(rawAgent),
    '/maps': [...names(10).map((n) => rawMap(n)), rawMap('The Range', false)],
    '/weapons': names(18).map(rawWeapon),
};

function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

function sourceFetch(data = liveData) {
    return async (url) => {
        const pathname = new URL(url).pathname.replace('/v1', '');
        return data[pathname] ? json({ status: 200, data: data[pathname] }) : json({}, 404);
    };
}

// Fakes the whole network: data/ files from `saved`, API calls per `api`.
function network({ saved = {}, api = 'up', version = '13.09.00.1' }) {
    const calls = [];
    const fetchImpl = async (url) => {
        const href = String(url);
        calls.push(href);
        if (href.includes('/data/')) {
            const name = href.split('/data/')[1].replace('.json', '');
            return saved[name] ? json(saved[name]) : json({}, 404);
        }
        if (api === 'down' || (api === 'version-only' && !href.endsWith('/version'))) throw new TypeError('network');
        return sourceFetch({ ...liveData, '/version': { ...liveData['/version'], version } })(href);
    };
    return { fetchImpl, calls };
}

const savedAgents = {
    version: { version: '13.09.00.1', patch: '13.09' },
    generatedAt: '2026-11-01T00:00:00Z',
    items: COLLECTIONS.agents.normalize(liveData['/agents']),
};

test('stripMarkup removes game markup and normalizes line breaks', () => {
    assert.equal(stripMarkup('<whitebold>Wingman</> goes\r\n\r\n<debuffred>now</>'), 'Wingman goes\n\nnow');
});

test('agents: abilities sorted in key order, only https images, only hex gradients', () => {
    const [agent] = COLLECTIONS.agents.normalize([rawAgent('KAY/O')]);
    assert.equal(agent.slug, 'kayo');
    assert.deepEqual(agent.abilities.map((a) => a.key), ['C', 'X']);
    assert.equal(agent.abilities[0].description, 'Throw it.\n\nTwice.');
    assert.equal(agent.thumb, 'https://media.example/small.png');
    assert.equal(agent.portrait, null);
    assert.deepEqual(agent.gradient, ['#371c5cff']);
});

test('maps: leaves out non-maps and groups callouts without repeats', () => {
    const maps = COLLECTIONS.maps.normalize(liveData['/maps']);
    assert.equal(maps.length, 10);
    assert.deepEqual(maps[0].callouts, [
        { region: 'A', names: ['Lobby', 'Tree'] },
        { region: 'B', names: ['Main'] },
    ]);
});

test('weapons: uses the category enum and tolerates a weapon without stats', () => {
    const [knife, rifle] = COLLECTIONS.weapons.normalize([
        { uuid: 'k', displayName: 'Melee', category: 'EEquippableCategory::Melee', displayIcon: null, shopData: null, weaponStats: null },
        rawWeapon('Vandal'),
    ]);
    assert.equal(knife.category, 'Melee');
    assert.equal(knife.stats, null);
    assert.equal(rifle.category, 'Rifle');
    assert.equal(rifle.stats.wallPenetration, 'Medium');
});

test('loader: same version keeps the saved copy and skips the full download', async () => {
    const { fetchImpl, calls } = network({ saved: { 'en-US/agents': savedAgents } });
    const renders = [];
    const status = await loadCollection('agents', { fetchImpl, onData: (items) => renders.push(items) });
    assert.equal(status.kind, STATUS.CURRENT);
    assert.equal(renders.length, 1);
    assert.ok(!calls.some((url) => url.includes('/v1/agents')));
});

test('loader: a new patch renders the saved copy, then the live data', async () => {
    const { fetchImpl } = network({ saved: { 'en-US/agents': savedAgents }, version: '13.10.00.1' });
    const renders = [];
    const status = await loadCollection('agents', { fetchImpl, onData: (items) => renders.push(items) });
    assert.equal(status.kind, STATUS.LIVE);
    assert.equal(renders.length, 2);
});

test('loader: source down falls back to the saved copy and says so', async () => {
    const { fetchImpl } = network({ saved: { 'en-US/agents': savedAgents }, api: 'down' });
    const renders = [];
    const status = await loadCollection('agents', { fetchImpl, onData: (items) => renders.push(items) });
    assert.equal(status.kind, STATUS.SAVED);
    assert.equal(status.patch, '13.09');
    assert.equal(renders.length, 1);
});

test('loader: new patch announced but its data unreachable keeps the saved copy', async () => {
    const { fetchImpl } = network({ saved: { 'en-US/agents': savedAgents }, api: 'version-only', version: '13.10.00.1' });
    const status = await loadCollection('agents', { fetchImpl, onData: () => {} });
    assert.equal(status.kind, STATUS.SAVED);
});

test('loader: missing saved copy uses the source', async () => {
    const { fetchImpl } = network({});
    const renders = [];
    const status = await loadCollection('agents', { fetchImpl, onData: (items) => renders.push(items) });
    assert.equal(status.kind, STATUS.LIVE);
    assert.equal(renders.length, 1);
});

test('loader: a corrupt saved copy is ignored rather than rendered', async () => {
    const { fetchImpl } = network({ saved: { 'en-US/agents': { items: [{ nope: true }] } } });
    const renders = [];
    await loadCollection('agents', { fetchImpl, onData: (items) => renders.push(items) });
    assert.equal(renders.length, 1);
    assert.ok(renders[0][0].id);
});

test('loader: nothing available rejects, which the page shows as the error state', async () => {
    const { fetchImpl } = network({ api: 'down' });
    await assert.rejects(loadCollection('agents', { fetchImpl, onData: () => assert.fail('nothing to render') }));
    await assert.rejects(loadSummary({ fetchImpl }));
});

test('every interface string exists in every language', () => {
    const english = Object.keys(STRINGS.en).sort();
    for (const language of Object.keys(LANGUAGES)) {
        assert.deepEqual(Object.keys(STRINGS[language]).sort(), english, language);
    }
});

test('slugify keeps links working for accented names', () => {
    assert.equal(slugify('Clásico'), 'clasico');
    assert.equal(slugify('KAY/O'), 'kayo');
});

test('loader: asks the saved copy and the source for the chosen language', async () => {
    const { fetchImpl, calls } = network({ saved: { 'es-MX/agents': savedAgents }, version: '13.10.00.1' });
    await loadCollection('agents', { language: 'es-MX', fetchImpl, onData: () => {} });
    assert.ok(calls.some((url) => url.includes('/data/es-MX/agents.json')));
    assert.ok(calls.some((url) => url.includes('/v1/agents') && url.includes('language=es-MX')));
});

async function withTempDir(run) {
    const dir = await mkdtemp(path.join(tmpdir(), 'valopedia-test-'));
    try {
        await run(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

test('updateData: writes once, then a second run with the same data changes nothing', async () => {
    await withTempDir(async (outDir) => {
        const first = await updateData({ outDir, fetchImpl: sourceFetch(), now: () => new Date('2026-11-05T00:00:00Z') });
        assert.equal(first.changed, true);
        assert.deepEqual(first.counts, { agents: 25, abilities: 50, maps: 10, weapons: 18 });
        const before = await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8');

        const second = await updateData({ outDir, fetchImpl: sourceFetch(), now: () => new Date('2026-11-06T00:00:00Z') });
        assert.equal(second.changed, false);
        assert.equal(await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8'), before);
    });
});

test('updateData: writes one copy per language', async () => {
    await withTempDir(async (outDir) => {
        await updateData({ outDir, fetchImpl: sourceFetch() });
        for (const language of ['en-US', 'es-MX']) {
            const saved = JSON.parse(await readFile(path.join(outDir, language, 'maps.json'), 'utf8'));
            assert.equal(saved.language, language);
        }
    });
});

test('updateData: one broken collection leaves every saved file untouched', async () => {
    await withTempDir(async (outDir) => {
        await updateData({ outDir, fetchImpl: sourceFetch() });
        const before = await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8');
        const newPatch = { ...liveData['/version'], version: '13.10.00.1', branch: 'release-13.10' };

        await assert.rejects(updateData({
            outDir,
            fetchImpl: sourceFetch({ ...liveData, '/version': newPatch, '/maps': [] }),
        }));
        assert.equal(await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8'), before);
    });
});

test('updateData: refuses a list that shrank too much', async () => {
    await withTempDir(async (outDir) => {
        await updateData({ outDir, fetchImpl: sourceFetch({ ...liveData, '/agents': names(40).map(rawAgent) }) });
        const before = await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8');
        await assert.rejects(updateData({ outDir, fetchImpl: sourceFetch() }), /refusing to overwrite/);
        assert.equal(await readFile(path.join(outDir, 'en-US', 'agents.json'), 'utf8'), before);
    });
});
