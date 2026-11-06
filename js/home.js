import { t } from './i18n.js';
import { loadSummary } from './loader.js';
import { showStatus } from './site.js';

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
