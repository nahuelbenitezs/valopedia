import { h, image, mountCollection } from '../../../js/site.js';
import { t, tOr } from '../../../js/i18n.js';
import { WEAPON_CATEGORY_ORDER } from '../../../js/valorant-data.js';

const stat = (label, value) => (value === null || value === undefined
    ? null
    : h('div', {}, h('dt', {}, label), h('dd', {}, value)));

function renderDamage(weapon) {
    const { damage } = weapon.stats;
    if (!damage.length) return null;
    return h('table', { class: 'damage' },
        h('caption', { class: 'visually-hidden' }, t('weapons.damage', { name: weapon.name })),
        h('thead', {}, h('tr', {},
            ['range', 'head', 'body', 'leg'].map((column) => h('th', { scope: 'col' }, t(`weapons.${column}`))))),
        h('tbody', {}, damage.map((range) => h('tr', {},
            h('th', { scope: 'row' }, `${range.from}-${range.to} m`),
            h('td', {}, Math.round(range.head)),
            h('td', {}, Math.round(range.body)),
            h('td', {}, Math.round(range.leg))))));
}

function renderWeapon(weapon) {
    const { stats } = weapon;
    return h('li', { class: 'weapon', id: weapon.slug },
        image({ src: weapon.icon, fallback: weapon.name, className: 'weapon-icon', width: 300, height: 80 }),
        h('h3', {}, weapon.name),
        stats
            ? h('dl', { class: 'weapon-stats' },
                stat(t('weapons.cost'), weapon.cost),
                stat(t('weapons.magazine'), stats.magazine),
                stat(t('weapons.fireRate'), `${stats.fireRate}/s`),
                stat(t('weapons.reload'), `${stats.reload} s`),
                stat(t('weapons.penetration'), tOr(`penetration.${stats.wallPenetration}`, stats.wallPenetration)))
            : null,
        stats ? renderDamage(weapon) : null);
}

function render(container, weapons) {
    const position = (category) => {
        const index = WEAPON_CATEGORY_ORDER.indexOf(category);
        return index === -1 ? WEAPON_CATEGORY_ORDER.length : index;
    };
    const categories = [...new Set(weapons.map((weapon) => weapon.category))]
        .sort((a, b) => position(a) - position(b));

    container.replaceChildren(
        h('h1', { class: 'page-title' }, t('weapons.title')),
        ...categories.map((category) => {
            const group = weapons.filter((weapon) => weapon.category === category);
            return h('section', { class: 'weapon-group' },
                h('h2', {}, tOr(`category.${category}`, category)),
                h('ul', { class: 'weapon-grid' }, group.map(renderWeapon)));
        }),
    );
}

mountCollection({ name: 'weapons', labelKey: 'label.weapons', render });
