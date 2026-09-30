/**
 * Botão flutuante (canto inferior direito) que aumenta o texto e o
 * contraste em todas as páginas. A preferência fica salva e vale pra
 * próxima visita também.
 */
(function () {
  const STORAGE_KEY = 'conectaMais:a11yAtivo';
  const ICON = 'A+';

  function lerPreferencia() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  }
  function salvarPreferencia(ativo) {
    try { localStorage.setItem(STORAGE_KEY, ativo ? '1' : '0'); } catch { /* sem storage, só não persiste */ }
  }

  function aplicar(ativo) {
    document.body.classList.toggle('a11y-ativo', ativo);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const ativo0 = lerPreferencia();
    aplicar(ativo0);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'a11y-toggle';
    btn.textContent = ICON;
    btn.setAttribute('aria-label', 'Aumentar texto e contraste');
    btn.setAttribute('aria-pressed', String(ativo0));
    btn.classList.toggle('a11y-toggle--ativo', ativo0);
    btn.addEventListener('click', () => {
      const novoEstado = !document.body.classList.contains('a11y-ativo');
      aplicar(novoEstado);
      salvarPreferencia(novoEstado);
      btn.setAttribute('aria-pressed', String(novoEstado));
      btn.classList.toggle('a11y-toggle--ativo', novoEstado);
    });
    document.body.appendChild(btn);

    const footer = document.querySelector('footer');
    if (footer && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => btn.classList.toggle('a11y-toggle--hidden', entry.isIntersecting),
        { rootMargin: '0px' }
      );
      observer.observe(footer);
    }
  });
})();
