// Decides where a page's data comes from. The saved copy in data/ renders first
// because it is same-origin and fast. Then a small version request tells whether
// the game has moved on, and only in that case the full collection is fetched.

import { assertValidItems, fetchCollection, fetchVersion, LANGUAGES } from './valorant-data.js';

export const STATUS = {
    CURRENT: 'current', // saved copy matches the source
    LIVE: 'live', // saved copy is behind or missing, showing data from the source
    SAVED: 'saved', // source unavailable, showing the saved copy
};

const VERSION_TIMEOUT_MS = 5000;
// /weapons is about 3.6 MB before compression because it includes every skin.
const COLLECTION_TIMEOUT_MS = 20000;

async function readSnapshot(relativePath, fetchImpl) {
    try {
        const url = new URL(`../data/${relativePath}.json`, import.meta.url);
        const response = await fetchImpl(url);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

async function readCollectionSnapshot(name, language, fetchImpl) {
    const snapshot = await readSnapshot(`${language}/${name}`, fetchImpl);
    try {
        assertValidItems(name, snapshot?.items);
        return snapshot;
    } catch {
        return null;
    }
}

// Calls onData once for each better version of the data it finds, so the page
// can render the saved copy and then replace it. Rejects only when neither the
// saved copy nor the source could provide anything.
export async function loadCollection(name, { onData, language = LANGUAGES[0], fetchImpl = fetch }) {
    const snapshot = await readCollectionSnapshot(name, language, fetchImpl);
    if (snapshot) onData(snapshot.items);

    const saved = () => ({
        kind: STATUS.SAVED,
        patch: snapshot.version?.patch ?? null,
        date: snapshot.generatedAt ?? null,
    });

    let liveVersion;
    try {
        liveVersion = await fetchVersion({ fetchImpl, timeoutMs: VERSION_TIMEOUT_MS });
    } catch (error) {
        if (snapshot) return saved();
        throw error;
    }

    if (snapshot?.version?.version === liveVersion.version) {
        return { kind: STATUS.CURRENT, patch: liveVersion.patch };
    }

    try {
        const items = await fetchCollection(name, { language, fetchImpl, timeoutMs: COLLECTION_TIMEOUT_MS });
        onData(items);
        return { kind: STATUS.LIVE, patch: liveVersion.patch };
    } catch (error) {
        if (snapshot) return saved();
        throw error;
    }
}

// The home page only needs the counts and the patch, not a whole collection.
export async function loadSummary({ fetchImpl = fetch } = {}) {
    const meta = await readSnapshot('meta', fetchImpl);
    let liveVersion = null;
    try {
        liveVersion = await fetchVersion({ fetchImpl, timeoutMs: VERSION_TIMEOUT_MS });
    } catch {
        // Reported through the status below.
    }

    if (!meta && !liveVersion) throw new Error('Neither the saved copy nor the source is available');
    if (!liveVersion) {
        return {
            counts: meta.counts,
            status: { kind: STATUS.SAVED, patch: meta.version?.patch ?? null, date: meta.generatedAt ?? null },
        };
    }
    const kind = meta?.version?.version === liveVersion.version ? STATUS.CURRENT : STATUS.LIVE;
    return { counts: meta?.counts ?? null, status: { kind, patch: liveVersion.patch } };
}
