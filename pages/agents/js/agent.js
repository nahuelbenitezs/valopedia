import { t } from '../../../js/i18n.js';
import { h, image, mountCollection, paragraphs } from '../../../js/site.js';

// Moved less than this, a press on the wheel is a click rather than a drag.
const DRAG_THRESHOLD_PX = 6;
// How far a flick keeps turning, in milliseconds of its release speed.
const FLICK_PROJECTION_MS = 180;
const PORTRAIT_EXIT_MS = 300;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function renderArt(art, agent, isFirstPaint) {
    for (const element of [...art.children]) {
        if (reducedMotion.matches) {
            element.remove();
        } else {
            element.classList.add('is-leaving');
            setTimeout(() => element.remove(), PORTRAIT_EXIT_MS);
        }
    }
    art.append(
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

function renderAbilityPicker(agent) {
    const panel = h('div', { class: 'ability-panel', 'aria-live': 'polite' });
    const show = (index) => {
        const ability = agent.abilities[index];
        buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        panel.replaceChildren(h('h2', {}, ability.name), ...paragraphs(ability.description));
    };
    const buttons = agent.abilities.map((ability, index) => h('button', {
        class: 'ability-pick',
        type: 'button',
        'aria-label': ability.name,
        title: ability.name,
        onclick: () => show(index),
    },
    ability.icon ? image({ src: ability.icon, width: 36, height: 36, lazy: false }) : null,
    h('span', { 'aria-hidden': 'true' }, ability.key === 'Passive' ? t('abilities.passive') : ability.key)));
    show(0);

    const pressKey = (letter) => {
        const index = agent.abilities.findIndex((ability) => ability.key === letter);
        if (index !== -1) show(index);
        return index !== -1;
    };
    return {
        pressKey,
        element: h('div', { class: 'ability-picker' },
            h('div', { class: 'ability-picks', role: 'group', 'aria-label': t('agents.abilitiesLabel') }, buttons),
            panel),
    };
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
    let picker = null;

    const detail = h('div', { class: 'agent-detail', 'aria-live': 'polite' });
    const art = h('div', { class: 'agent-art' });
    const vertical = h('p', { class: 'agent-vertical', 'aria-hidden': 'true' });
    const stage = h('section', { class: 'agent-stage' });

    const paintAgent = (isFirstPaint) => {
        const agent = agents[selected];
        const [from, via, to] = agent.gradient;
        if (from) stage.style.setProperty('--agent-a', from);
        if (via) stage.style.setProperty('--agent-b', via);
        if (to) stage.style.setProperty('--agent-c', to);
        renderArt(art, agent, isFirstPaint);
        vertical.textContent = agent.name;
        picker = renderAbilityPicker(agent);
        detail.replaceChildren(
            h('h1', { class: 'agent-name' }, h('span', {}, agent.name)),
            h('p', { class: 'agent-role' },
                agent.role.icon ? image({ src: agent.role.icon, width: 24, height: 24, lazy: false }) : null,
                agent.role.name),
            h('div', { class: 'agent-bio' }, paragraphs(agent.description)),
            picker.element,
            h('a', { class: 'button', href: `../abilities/abilities.html#${agent.slug}` }, t('agents.seeAbilities')),
        );
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

    const setRotation = (degrees) => {
        rotation = degrees;
        ring.style.setProperty('--rotation', `${rotation}deg`);
    };

    function select(index, { focus = false } = {}) {
        const changed = ((index + agents.length) % agents.length) !== selected;
        selected = (index + agents.length) % agents.length;
        // Turn the short way round, even across the point where the list wraps.
        const delta = (((-selected * step - rotation) % 360) + 540) % 360 - 180;
        setRotation(rotation + delta);
        thumbs.forEach((thumb, i) => {
            thumb.setAttribute('aria-checked', String(i === selected));
            thumb.tabIndex = i === selected ? 0 : -1;
        });
        // preventScroll: the thumb may be cropped at the side on a phone.
        if (focus) thumbs[selected].focus({ preventScroll: true });
        if (changed) {
            history.replaceState(null, '', `#${agents[selected].slug}`);
            paintAgent(false);
        }
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

    // C, Q, E and X work like in the game, but only while focus is inside the
    // stage, so these single keys never get in the way elsewhere on the page.
    stage.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (picker.pressKey(event.key.toUpperCase())) event.preventDefault();
    });

    const area = h('div', { class: 'agent-wheel-area' },
        art,
        ring,
        h('button', { class: 'wheel-step wheel-prev', type: 'button', 'aria-label': t('agents.previous'), onclick: () => select(selected - 1) },
            h('span', { 'aria-hidden': 'true' }, '<')),
        h('button', { class: 'wheel-step wheel-next', type: 'button', 'aria-label': t('agents.next'), onclick: () => select(selected + 1) },
            h('span', { 'aria-hidden': 'true' }, '>')));

    // Dragging spins the wheel with the pointer and settles on the nearest agent.
    let drag = null;
    const pointerAngle = (event) => {
        const box = ring.getBoundingClientRect();
        return Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2)) * (180 / Math.PI);
    };
    area.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('.wheel-step')) return;
        drag = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastAngle: pointerAngle(event),
            lastTime: event.timeStamp,
            speed: 0,
            active: false,
        };
    });
    area.addEventListener('pointermove', (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        if (!drag.active) {
            if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD_PX) return;
            drag.active = true;
            area.classList.add('is-dragging');
            area.setPointerCapture(event.pointerId);
        }
        const angle = pointerAngle(event);
        const delta = ((angle - drag.lastAngle + 540) % 360) - 180;
        const elapsed = Math.max(event.timeStamp - drag.lastTime, 1);
        drag.speed = delta / elapsed;
        drag.lastAngle = angle;
        drag.lastTime = event.timeStamp;
        setRotation(rotation + delta);
    });
    const endDrag = (event, flick) => {
        if (!drag || event.pointerId !== drag.id) return;
        const { active, speed } = drag;
        drag = null;
        if (!active) return;
        area.classList.remove('is-dragging');
        // A thumb under the pointer must not also read this as a click. Touch
        // sends no click after a drag, so the guard can't wait around for one.
        const swallowClick = (click) => click.stopPropagation();
        area.addEventListener('click', swallowClick, { capture: true, once: true });
        setTimeout(() => area.removeEventListener('click', swallowClick, { capture: true }), 100);
        const projected = rotation + (flick ? speed * FLICK_PROJECTION_MS : 0);
        const index = Math.round(-projected / step);
        select(((index % agents.length) + agents.length) % agents.length);
    };
    area.addEventListener('pointerup', (event) => endDrag(event, true));
    area.addEventListener('pointercancel', (event) => endDrag(event, false));

    stage.append(detail, area, vertical);
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
