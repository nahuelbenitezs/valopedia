import { t } from '../../../js/i18n.js';
import { h, image, mountCollection, paragraphs } from '../../../js/site.js';

function renderAbility(ability) {
    return h('li', { class: 'ability' },
        h('div', { class: 'ability-head' },
            ability.icon
                ? image({ src: ability.icon, fallback: ability.name, width: 40, height: 40, className: 'ability-icon' })
                : null,
            h('h3', {}, ability.name),
            ability.key ? h('span', { class: 'ability-key', title: t('abilities.defaultKey') }, ability.key === 'Passive' ? t('abilities.passive') : ability.key) : null),
        h('div', { class: 'ability-text' }, paragraphs(ability.description)));
}

function renderAgent(agent) {
    return h('section', { class: 'ability-group', id: agent.slug, 'aria-labelledby': `${agent.slug}-title` },
        h('header', { class: 'ability-agent' },
            image({ src: agent.thumb, fallback: agent.name, width: 64, height: 64 }),
            h('div', {},
                h('h2', { id: `${agent.slug}-title` },
                    h('a', { href: `../agents/agent.html#${agent.slug}` }, agent.name)),
                h('p', {}, agent.role.name))),
        h('ul', { class: 'ability-list' }, agent.abilities.map(renderAbility)));
}

function render(container, agents) {
    container.replaceChildren(
        h('h1', { class: 'page-title' }, t('abilities.title')),
        h('nav', { class: 'chip-rail', 'aria-label': t('abilities.jump') },
            agents.map((agent) => h('a', { class: 'chip', href: `#${agent.slug}` }, agent.name))),
        ...agents.map(renderAgent),
    );
    // The sections did not exist yet when the browser tried to follow the hash.
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

mountCollection({ name: 'agents', labelKey: 'label.abilities', render });
