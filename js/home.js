import { apiLanguage, t } from './i18n.js';
import { loadCollection, loadSummary } from './loader.js';
import { h, image, showStatus } from './site.js';

const MS_PER_DAY = 86400000;

// Everyone sees the same agent on the same day, and a new one tomorrow.
function agentOfTheDay(agents) {
    return agents[Math.floor(Date.now() / MS_PER_DAY) % agents.length];
}

function renderHero(agents) {
    const agent = agentOfTheDay(agents);
    const hero = document.querySelector('.hero');
    const [from, via, to] = agent.gradient;
    if (from) hero.style.setProperty('--agent-a', from);
    if (via) hero.style.setProperty('--agent-b', via);
    if (to) hero.style.setProperty('--agent-c', to);

    document.getElementById('hero-agent').replaceChildren(
        image({ src: agent.portrait, alt: t('agents.portrait', { name: agent.name }), fallback: agent.name, priority: true, lazy: false }),
    );
    const link = document.getElementById('hero-agent-link');
    link.href = `pages/agents/agent.html#${agent.slug}`;
    link.replaceChildren(h('span', {}, t('home.agentOfDay')), h('strong', {}, agent.name));
    link.hidden = false;

    // Two identical halves, so the loop can restart without a visible jump.
    const names = agents.map((item) => h('span', {}, item.name));
    document.getElementById('hero-marquee').replaceChildren(
        h('div', {}, names),
        h('div', {}, names.map((name) => name.cloneNode(true))),
    );
}

async function showCounts() {
    try {
        const { counts, status } = await loadSummary();
        showStatus(status);
        for (const [name, count] of Object.entries(counts ?? {})) {
            const slot = document.querySelector(`[data-count="${name}"]`);
            if (slot) slot.textContent = count;
        }
    } catch {
        // The links work without the counts, so a short notice is enough here.
        const box = document.getElementById('data-status');
        box.classList.add('is-warning');
        box.textContent = t('status.down');
    }
}

// Not awaited at the top level: the page render waits for this module to run,
// and it must not wait for the network too.
showCounts();
loadCollection('agents', { language: apiLanguage(), onData: renderHero }).catch(() => {
    // The headline and links still work without the agent.
});
