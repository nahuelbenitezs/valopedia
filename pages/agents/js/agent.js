import { t } from '../../../js/i18n.js';
import { h, image, mountCollection, paragraphs } from '../../../js/site.js';

const SWIPE_STEP_PX = 48;

function renderArt(art, agent, isFirstPaint) {
    art.replaceChildren(
        ...(agent.background ? [image({ src: agent.background, className: 'agent-art-word', lazy: false })] : []),
        image({
            src: agent.portrait,
            alt: t('agents.portrait', { name: agent.name }),
            fallback: agent.name,
            className: 'agent-art-portrait',
            priority: isFirstPaint,
            lazy: false,
        }),
    );
}

function renderDetail(detail, agent) {
    detail.replaceChildren(
        h('h1', { class: 'agent-name' }, agent.name),
        h('p', { class: 'agent-role' },
            agent.role.icon ? image({ src: agent.role.icon, width: 24, height: 24, lazy: false }) : null,
            agent.role.name),
        h('div', { class: 'agent-bio' }, paragraphs(agent.description)),
        h('p', { class: 'agent-role-note' }, agent.role.description),
        h('a', { class: 'button', href: `../abilities/abilities.html#${agent.slug}` }, t('nav.abilities')),
    );
}

function render(container, agents) {
    const previous = container.querySelector('.agent-thumb[aria-checked="true"]')?.dataset.slug;
    // The hash can also be #main, from the skip link, which is not an agent.
    const found = [location.hash.slice(1), previous]
        .map((slug) => agents.findIndex((agent) => agent.slug === slug))
        .find((index) => index !== -1) ?? 0;
    // A live update replaces the wheel, which must not drop keyboard focus.
    const hadFocus = Boolean(document.activeElement?.closest('.agent-ring'));
    const step = 360 / agents.length;
    let selected = found;
    let rotation = -selected * step;

    const detail = h('div', { class: 'agent-detail', 'aria-live': 'polite' });
    const art = h('div', { class: 'agent-art' });
    const stage = h('section', { class: 'agent-stage' });

    const paintAgent = (isFirstPaint) => {
        const agent = agents[selected];
        const [from, via, to] = agent.gradient;
        if (from) stage.style.setProperty('--agent-a', from);
        if (via) stage.style.setProperty('--agent-b', via);
        if (to) stage.style.setProperty('--agent-c', to);
        renderArt(art, agent, isFirstPaint);
        renderDetail(detail, agent);
    };

    const thumbs = agents.map((agent, index) => h('button', {
        class: 'agent-thumb',
        type: 'button',
        role: 'radio',
        title: agent.name,
        'aria-label': agent.name,
        'data-slug': agent.slug,
        'aria-checked': String(index === selected),
        tabindex: index === selected ? '0' : '-1',
        style: `--angle: ${index * step}deg`,
        onclick: () => select(index),
    }, image({ src: agent.thumb, fallback: agent.name, width: 64, height: 64, lazy: false })));

    const ring = h('div', {
        class: 'agent-ring',
        role: 'radiogroup',
        'aria-label': t('agents.choose'),
        style: `--rotation: ${rotation}deg; --count: ${agents.length}`,
    }, thumbs);

    function select(index, { focus = false } = {}) {
        selected = (index + agents.length) % agents.length;
        // Turn the short way round, even across the point where the list wraps.
        const delta = (((-selected * step - rotation) % 360) + 540) % 360 - 180;
        rotation += delta;
        ring.style.setProperty('--rotation', `${rotation}deg`);
        thumbs.forEach((thumb, i) => {
            thumb.setAttribute('aria-checked', String(i === selected));
            thumb.tabIndex = i === selected ? 0 : -1;
        });
        // preventScroll: the thumb may be cropped at the side on a phone.
        if (focus) thumbs[selected].focus({ preventScroll: true });
        history.replaceState(null, '', `#${agents[selected].slug}`);
        paintAgent(false);
    }

    ring.addEventListener('keydown', (event) => {
        const moves = {
            ArrowRight: selected + 1,
            ArrowDown: selected + 1,
            ArrowLeft: selected - 1,
            ArrowUp: selected - 1,
            Home: 0,
            End: agents.length - 1,
        };
        if (!(event.key in moves)) return;
        event.preventDefault();
        select(moves[event.key], { focus: true });
    });

    const area = h('div', { class: 'agent-wheel-area' },
        art,
        ring,
        h('button', { class: 'wheel-step wheel-prev', type: 'button', 'aria-label': t('agents.previous'), onclick: () => select(selected - 1) },
            h('span', { 'aria-hidden': 'true' }, '<')),
        h('button', { class: 'wheel-step wheel-next', type: 'button', 'aria-label': t('agents.next'), onclick: () => select(selected + 1) },
            h('span', { 'aria-hidden': 'true' }, '>')));

    let swipeStart = null;
    area.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') swipeStart = event.clientX;
    });
    area.addEventListener('pointerup', (event) => {
        if (swipeStart === null) return;
        const moved = Math.round((swipeStart - event.clientX) / SWIPE_STEP_PX);
        swipeStart = null;
        if (moved) select(selected + moved);
    });
    area.addEventListener('pointercancel', () => { swipeStart = null; });

    stage.append(detail, area);
    container.replaceChildren(stage);
    paintAgent(true);
    if (hadFocus) thumbs[selected].focus({ preventScroll: true });

    followHash = () => {
        const index = agents.findIndex((agent) => agent.slug === location.hash.slice(1));
        if (index !== -1 && index !== selected) select(index);
    };
}

// render() can run twice, so one listener calls whichever wheel is current.
let followHash = () => {};
window.addEventListener('hashchange', () => followHash());

mountCollection({ name: 'agents', labelKey: 'label.agents', render });
