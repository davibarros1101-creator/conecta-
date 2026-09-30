/**
 * Página inicial: lista de categorias (com ícone SVG), registro do service
 * worker e botão "Instalar app" (só aparece quando o navegador confirma
 * que o site atende aos critérios de PWA instalável).
 */
const ICON_WARNING = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';

const list = document.querySelector('[data-categories]');
const categorias = [...new Set(SCENARIOS.filter((s) => s.isGolpe).map((s) => s.categoria))];
list.innerHTML = categorias.map((c) => `<div class="category-chip">${ICON_WARNING}<span>${c}</span></div>`).join('');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Botão "Instalar app": some por padrão, só aparece quando o navegador
// dispara beforeinstallprompt (site já atende aos critérios de PWA -
// manifest, service worker e HTTPS, ou localhost).
(function () {
  let deferredPrompt = null;
  const installBtn = document.querySelector('[data-install-btn]');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBtn.hidden = true;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
    deferredPrompt = null;
  });
})();
