/**
 * Painel de "Novidades" (só existe na home, onde tem o sino + modal) e
 * aviso de atualização (em todas as páginas): quando o service worker
 * detecta uma versão nova do site, mostra um aviso simples oferecendo ver
 * o que mudou. Usa localStorage só pra lembrar até onde a pessoa já viu
 * (conveniência de exibição, não dado sensível).
 */
const CHANGELOG_SEEN_KEY = 'conectaMais:changelogSeen';
const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>';

function contarNovidades() {
  if (typeof CHANGELOG === 'undefined' || !CHANGELOG.length) return 0;
  let visto = '';
  try { visto = localStorage.getItem(CHANGELOG_SEEN_KEY) || ''; } catch { /* sem localStorage */ }
  if (!visto) return 0; // primeira visita: nada "novo" ainda, so passa a contar dali pra frente
  const idx = CHANGELOG.findIndex((c) => c.version === visto);
  return idx === -1 ? CHANGELOG.length : idx;
}

function marcarComoVisto() {
  if (typeof CHANGELOG === 'undefined' || !CHANGELOG.length) return;
  try { localStorage.setItem(CHANGELOG_SEEN_KEY, CHANGELOG[0].version); } catch { /* sem localStorage */ }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

(function initPainelNovidades() {
  const bell = document.querySelector('[data-changelog-bell]');
  const badge = document.querySelector('[data-changelog-badge]');
  const modal = document.querySelector('[data-changelog-modal]');
  const list = document.querySelector('[data-changelog-list]');
  if (!bell || !modal || typeof CHANGELOG === 'undefined') return;

  const novas = contarNovidades();
  if (novas > 0 && badge) {
    badge.hidden = false;
    badge.textContent = novas > 9 ? '9+' : String(novas);
  }

  function render() {
    list.innerHTML = CHANGELOG.map((c, i) => `
      <div class="changelog-item">
        <div class="changelog-item__head">
          <strong>${esc(c.title)}</strong>
          ${i < novas ? '<span class="changelog-item__tag">NOVO</span>' : ''}
          <span class="changelog-item__date">${new Date(`${c.date}T12:00:00`).toLocaleDateString('pt-BR')}</span>
        </div>
        <p>${esc(c.description)}</p>
      </div>
    `).join('');
  }

  function abrir() {
    render();
    modal.hidden = false;
    document.body.classList.add('tour-active');
    marcarComoVisto();
    if (badge) badge.hidden = true;
  }
  function fechar() {
    modal.hidden = true;
    document.body.classList.remove('tour-active');
  }

  bell.addEventListener('click', abrir);
  modal.querySelectorAll('[data-changelog-close]').forEach((el) => el.addEventListener('click', fechar));

  window.abrirNovidadesConectaMais = abrir;
})();

// Aviso de atualização, em qualquer página: aparece quando o service
// worker novo assume o controle (skipWaiting + clients.claim já fazem
// isso acontecer rápido, sem precisar fechar a aba).
(function initAvisoAtualizacao() {
  if (!('serviceWorker' in navigator)) return;

  function mostrarToast() {
    if (document.querySelector('[data-update-toast]')) return;
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.setAttribute('data-update-toast', '');
    const temPainelAqui = Boolean(document.querySelector('[data-changelog-modal]'));
    toast.innerHTML = `
      <span>O Conecta+ foi atualizado.</span>
      <button type="button" class="btn btn-primary" data-ver-novidades>Ver novidades</button>
      <button type="button" class="update-toast__fechar" data-fechar-toast aria-label="Fechar aviso">${ICON_CLOSE}</button>
    `;
    document.body.appendChild(toast);
    toast.querySelector('[data-ver-novidades]').addEventListener('click', () => {
      if (temPainelAqui && window.abrirNovidadesConectaMais) {
        window.abrirNovidadesConectaMais();
        toast.remove();
      } else {
        window.location.href = 'index.html#novidades';
      }
    });
    // Sem botão de fechar, um aviso que aparece bem em cima de um card
    // clicável deixava a pessoa "travada" esperando os 15s passarem
    // (achado real, visto numa revisão de tela em resolução de notebook).
    toast.querySelector('[data-fechar-toast]').addEventListener('click', () => toast.remove());
    setTimeout(() => toast.remove(), 15000);
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // só avisa se já havia um controller antes (ou seja, não é a
    // primeira visita/instalação do service worker)
    if (navigator.serviceWorker.controller) mostrarToast();
  });
})();

// Se a pessoa chegou na home vinda do link do aviso ("...#novidades"),
// abre o painel automaticamente.
if (window.location.hash === '#novidades' && window.abrirNovidadesConectaMais) {
  window.abrirNovidadesConectaMais();
}
