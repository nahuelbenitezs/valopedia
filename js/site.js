// What every page shares: the mobile menu, safe DOM building and the loading,
// error and data-status states.

import { apiLanguage, currentLanguage, LANGUAGES, setLanguage, t } from './i18n.js';
import { loadCollection, STATUS } from './loader.js';

// Everything from the data source goes in as text or a checked property, never
// as HTML.
export function h(tag, props = {}, ...children) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(props)) {
        if (value === null || value === undefined || value === false) continue;
        if (name === 'class') element.className = value;
        else if (name.startsWith('on')) element.addEventListener(name.slice(2), value);
        else element.setAttribute(name, value === true ? '' : value);
    }
    element.append(...children.flat().filter((child) => child !== null && child !== undefined));
    return element;
}

// An image that gives way to a labelled placeholder if the image host is down.
// The text data can come from the saved copy, but the images always come from
// media.valorant-api.com.
export function image({ src, alt = '', fallback = '', width, height, lazy = true, priority = false, className }) {
    const placeholder = () => h('span', { class: `img-missing ${className ?? ''}`, 'aria-hidden': 'true' }, fallback.charAt(0));
    if (!src) return placeholder();
    const img = h('img', {
        src,
        alt,
        width,
        height,
        class: className,
        decoding: 'async',
        loading: lazy && !priority ? 'lazy' : null,
        fetchpriority: priority ? 'high' : null,
    });
    img.addEventListener('error', () => img.replaceWith(placeholder()), { once: true });
    return img;
}

export function paragraphs(text) {
    return text.split(/\n+/).filter(Boolean).map((line) => h('p', {}, line));
}

function formatDate(iso) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(currentLanguage(), { year: 'numeric', month: 'short', day: 'numeric' });
}

export function showStatus({ kind, patch, date }) {
    const box = document.getElementById('data-status');
    if (!box) return;
    box.classList.toggle('is-warning', kind === STATUS.SAVED);
    if (kind === STATUS.CURRENT) {
        box.textContent = t('status.current', { patch });
    } else if (kind === STATUS.LIVE) {
        box.textContent = t('status.live', { patch });
    } else {
        const savedOn = formatDate(date);
        const from = [patch && t('status.patch', { patch }), savedOn && t('status.date', { date: savedOn })].filter(Boolean).join(', ');
        box.textContent = t('status.saved', { detail: from ? ` (${from})` : '' });
    }
}

function showError(container, label, retry) {
    container.removeAttribute('aria-busy');
    container.replaceChildren(
        h('div', { class: 'state-error', role: 'alert' },
            h('h2', {}, t('error.title', { label })),
            h('p', {}, t('error.text')),
            h('button', { class: 'button', type: 'button', onclick: retry }, t('error.retry'))),
    );
}

function showSkeleton(container, label, count) {
    container.setAttribute('aria-busy', 'true');
    container.replaceChildren(
        h('p', { class: 'visually-hidden', role: 'status' }, t('loading', { label })),
        h('div', { class: 'skeleton-grid', 'aria-hidden': 'true' },
            Array.from({ length: count }, () => h('div', { class: 'skeleton' }))),
    );
}

// Wires one page to one collection. render() may run twice, first with the
// saved copy and then with newer data, so it must rebuild from scratch.
export function mountCollection({ name, labelKey, render }) {
    const label = t(labelKey);
    const container = document.getElementById('content');
    const run = async () => {
        showSkeleton(container, label, 8);
        try {
            const status = await loadCollection(name, {
                language: apiLanguage(),
                onData: (items) => {
                    container.removeAttribute('aria-busy');
                    render(container, items);
                },
            });
            showStatus(status);
        } catch {
            showError(container, label, run);
        }
    };
    run();
}

function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
        nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
}

// Static text in the HTML is English. This swaps it before the page settles.
function applyLanguage() {
    document.documentElement.lang = currentLanguage();
    for (const element of document.querySelectorAll('[data-i18n]')) {
        element.textContent = t(element.dataset.i18n);
    }
    for (const element of document.querySelectorAll('[data-i18n-attr]')) {
        const [attribute, key] = element.dataset.i18nAttr.split(':');
        element.setAttribute(attribute, t(key));
    }
    const source = document.querySelector('[data-i18n-source]');
    if (source) {
        const [before, after] = t('footer.source', { source: '|' }).split('|');
        source.replaceChildren(before, h('a', { href: 'https://valorant-api.com/' }, 'valorant-api.com'), after);
    }
}

function initLanguageSwitch() {
    for (const button of document.querySelectorAll('[data-lang]')) {
        const { lang } = button.dataset;
        if (!LANGUAGES[lang]) continue;
        button.setAttribute('aria-pressed', String(lang === currentLanguage()));
        button.addEventListener('click', () => {
            if (lang === currentLanguage()) return;
            setLanguage(lang);
            location.reload();
        });
    }
}

applyLanguage();
initLanguageSwitch();
initMenu();
