import { t } from '../../../js/i18n.js';
import { h, image, mountCollection } from '../../../js/site.js';

function renderCallouts(map) {
    if (!map.callouts.length) return null;
    const total = map.callouts.reduce((sum, group) => sum + group.names.length, 0);
    return h('details', { class: 'map-details' },
        h('summary', {}, t('maps.details', { count: total })),
        image({ src: map.minimap, alt: t('maps.minimap', { name: map.name }), fallback: map.name, className: 'map-minimap', width: 320, height: 320 }),
        h('dl', { class: 'map-callouts' },
            map.callouts.map(({ region, names }) => h('div', {},
                h('dt', {}, region),
                h('dd', {}, names.join(', '))))));
}

function renderMap(map) {
    return h('li', { class: 'map-card', id: map.slug },
        image({ src: map.banner, fallback: map.name, className: 'map-banner', width: 452, height: 128 }),
        h('div', { class: 'map-body' },
            h('h3', {}, map.name),
            map.sites ? h('p', {}, map.sites) : null,
            renderCallouts(map)));
}

function renderGroup(title, maps) {
    if (!maps.length) return null;
    return h('section', { class: 'map-group' },
        h('h2', {}, title),
        h('ul', { class: 'map-grid' }, maps.map(renderMap)));
}

function render(container, maps) {
    container.replaceChildren(...[
        h('h1', { class: 'page-title' }, t('maps.title')),
        renderGroup(t('maps.competitive'), maps.filter((map) => map.sites)),
        renderGroup(t('maps.other'), maps.filter((map) => !map.sites)),
    ].filter(Boolean));
}

mountCollection({ name: 'maps', labelKey: 'label.maps', render });
