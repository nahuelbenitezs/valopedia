// Refreshes the saved copy in data/ from valorant-api.com.
// Everything is fetched and validated before the first write, so a failure
// leaves the current copy untouched. Exits non-zero on failure, which makes the
// scheduled GitHub Action show up as failed.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COLLECTIONS, fetchCollection, fetchVersion, LANGUAGES } from '../js/valorant-data.js';

// A new list this much shorter than the saved one looks like a source problem,
// not like Riot removing a third of the game.
const MIN_KEPT_RATIO = 0.7;

async function readJson(file) {
    try {
        return JSON.parse(await readFile(file, 'utf8'));
    } catch {
        return null;
    }
}

export async function updateData({ outDir, fetchImpl = fetch, now = () => new Date() }) {
    const names = Object.keys(COLLECTIONS);
    const version = await fetchVersion({ fetchImpl, timeoutMs: 30000 });
    const fresh = {};
    for (const language of LANGUAGES) {
        fresh[language] = {};
        for (const name of names) {
            fresh[language][name] = await fetchCollection(name, { language, fetchImpl, timeoutMs: 60000 });
        }
    }

    let changed = false;
    for (const language of LANGUAGES) {
        for (const name of names) {
            const items = fresh[language][name];
            const saved = await readJson(path.join(outDir, language, `${name}.json`));
            const savedCount = saved?.items?.length ?? 0;
            if (items.length < savedCount * MIN_KEPT_RATIO) {
                throw new Error(`${language}/${name}: the source returned ${items.length} items but ${savedCount} are saved, refusing to overwrite`);
            }
            // generatedAt is left out on purpose: it must not create a commit
            // when nothing else changed.
            if (JSON.stringify({ version: saved?.version, items: saved?.items })
                !== JSON.stringify({ version, items })) {
                changed = true;
            }
        }
    }
    if (!changed) return { changed: false, version };

    const generatedAt = now().toISOString();
    for (const language of LANGUAGES) {
        await mkdir(path.join(outDir, language), { recursive: true });
        for (const name of names) {
            const body = { source: 'https://valorant-api.com', language, version, generatedAt, items: fresh[language][name] };
            await writeFile(path.join(outDir, language, `${name}.json`), `${JSON.stringify(body, null, 1)}\n`);
        }
    }
    const { agents, maps, weapons } = fresh[LANGUAGES[0]];
    const counts = {
        agents: agents.length,
        abilities: agents.reduce((sum, agent) => sum + agent.abilities.length, 0),
        maps: maps.length,
        weapons: weapons.length,
    };
    await writeFile(path.join(outDir, 'meta.json'), `${JSON.stringify({ version, generatedAt, counts }, null, 1)}\n`);
    return { changed: true, version, counts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
    updateData({ outDir }).then(
        (result) => console.log(result.changed
            ? `Updated data to patch ${result.version.patch}: ${JSON.stringify(result.counts)}`
            : `No changes, still patch ${result.version.patch}`),
        (error) => {
            console.error(error);
            process.exitCode = 1;
        },
    );
}
