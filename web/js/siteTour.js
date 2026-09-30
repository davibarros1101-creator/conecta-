/**
 * Tour guiado explicativo, por página (botão flutuante no canto inferior
 * esquerdo). Cada página define seus próprios passos em STEPS_BY_PAGE,
 * identificados por `document.body.dataset.tourPage`; páginas sem entrada
 * aqui não mostram o botão. Passos cujo elemento não existir na página no
 * momento são pulados automaticamente, sem quebrar o tour.
 */
(function () {
  const STEPS_BY_PAGE = {
    home: [
      { selector: '.hero__brand', title: 'Bem-vindo ao Conecta+', text: 'Aqui você aprende a reconhecer golpes digitais na prática, e também pode conferir mensagens reais que você recebeu.' },
      { selector: '.verify-cta', title: 'Recebeu algo suspeito?', text: 'Clique aqui pra enviar o print (foto de tela) de uma mensagem real e descobrir na hora se tem sinais de golpe.' },
      { selector: '.hero__actions .btn-primary', title: 'Treinar identificando golpes', text: 'Esse botão leva pro modo de prática: você vê situações parecidas com golpes reais e aprende a reconhecer os sinais de alerta.' },
      { selector: '[data-categories]', title: 'O que você vai encontrar', text: 'Essas são as categorias de golpe mais comuns que o Conecta+ ensina a identificar.' },
      { selector: '[data-install-btn]', title: 'Instalar como aplicativo', text: 'Se aparecer esse botão, você pode instalar o Conecta+ no celular ou computador, como um aplicativo de verdade.' },
    ],
    praticar: [
      { selector: '.practice-progress', title: 'Seu progresso', text: 'Mostra em qual situação você está, de um total de 12.' },
      { selector: '.message-bubble', title: 'A mensagem', text: 'Leia com atenção, como se tivesse recebido essa mensagem de verdade no seu celular.' },
      { selector: '.decision-buttons', title: 'Sua decisão', text: 'Escolha SIM se parece um golpe, ou NÃO se parece uma mensagem normal. Depois você vê a explicação certa.' },
    ],
    verificar: [
      { selector: '.verify-tabs', title: 'Duas formas de verificar', text: 'Envie um print (foto de tela) ou cole o texto da mensagem, o que for mais fácil pra você.' },
      { selector: '[data-upload-area]', title: 'Enviar o print', text: 'Clique aqui pra escolher uma imagem do seu celular ou computador, ou arraste o arquivo pra essa área.' },
      { selector: '[data-analisar-btn]', title: 'Analisar', text: 'Depois de escolher a imagem ou colar o texto, clique aqui. A leitura acontece no seu aparelho, a imagem não é enviada pra nenhum lugar.' },
    ],
    'verificar-rosto': [
      { selector: '.face-disclaimer', title: 'Um apoio, não uma prova', text: 'A comparação de rosto pode errar. Nunca use só isso pra decidir - sempre confirme também por outro meio.' },
      { selector: '[data-abrir-cadastro]', title: 'Cadastre uma pessoa de confiança', text: 'Antes de verificar, cadastre o rosto de alguém que você confia (um filho, uma filha, um amigo), pela câmera ou enviando uma foto.' },
      { selector: '[data-abrir-verificacao]', title: 'Comparar na hora', text: 'Numa videochamada estranha, clique aqui pra comparar o rosto da pessoa com quem você já cadastrou.' },
    ],
  };

  const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>';
  const COMPASS_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>';

  let activeSteps = [];
  let stepIndex = 0;
  let overlayEl = null;
  let tooltipEl = null;
  let highlightedEl = null;

  function cleanupHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove('tour-highlight');
      highlightedEl = null;
    }
  }

  function endTour() {
    cleanupHighlight();
    if (overlayEl) overlayEl.remove();
    if (tooltipEl) tooltipEl.remove();
    overlayEl = null;
    tooltipEl = null;
    document.body.classList.remove('tour-active');
  }

  function positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    let top = rect.bottom + 14;
    let left = rect.left;

    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = rect.top - tooltipRect.height - 14;
    }
    if (top < 10) top = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (left < 10) left = 10;

    tooltipEl.style.top = `${top + window.scrollY}px`;
    tooltipEl.style.left = `${left}px`;
  }

  function renderStep() {
    if (stepIndex >= activeSteps.length) {
      endTour();
      return;
    }
    const step = activeSteps[stepIndex];
    const target = document.querySelector(step.selector);
    // Pula passos cujo elemento não existe ou está escondido de verdade
    // (ex.: o botão "Instalar app" só aparece quando o navegador libera).
    if (!target || target.offsetParent === null) {
      stepIndex += 1;
      renderStep();
      return;
    }

    cleanupHighlight();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('tour-highlight');
    highlightedEl = target;

    tooltipEl.innerHTML = `
      <button type="button" class="tour-tooltip__close" aria-label="Fechar tour">${CLOSE_ICON}</button>
      <strong>${step.title}</strong>
      <p>${step.text}</p>
      <div class="tour-tooltip__footer">
        <span>${stepIndex + 1} de ${activeSteps.length}</span>
        <div class="tour-tooltip__actions">
          ${stepIndex > 0 ? '<button type="button" class="btn btn-outline" data-tour-prev>Voltar</button>' : ''}
          <button type="button" class="btn btn-primary" data-tour-next>${stepIndex + 1 < activeSteps.length ? 'Próximo' : 'Concluir'}</button>
        </div>
      </div>
    `;
    tooltipEl.querySelector('.tour-tooltip__close').addEventListener('click', endTour);
    tooltipEl.querySelector('[data-tour-next]').addEventListener('click', () => { stepIndex += 1; renderStep(); });
    const prevBtn = tooltipEl.querySelector('[data-tour-prev]');
    if (prevBtn) prevBtn.addEventListener('click', () => { stepIndex -= 1; renderStep(); });

    setTimeout(() => positionTooltip(target), 50);
  }

  function startTour(steps) {
    activeSteps = steps;
    stepIndex = 0;
    document.body.classList.add('tour-active');

    overlayEl = document.createElement('div');
    overlayEl.className = 'tour-overlay';
    overlayEl.addEventListener('click', endTour);
    document.body.appendChild(overlayEl);

    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tour-tooltip';
    document.body.appendChild(tooltipEl);

    renderStep();
  }

  function buildButton(steps) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tour-toggle';
    btn.setAttribute('aria-label', 'Iniciar tour guiado desta página');
    btn.innerHTML = COMPASS_ICON;
    btn.addEventListener('click', () => startTour(steps));
    document.body.appendChild(btn);

    const footer = document.querySelector('footer');
    if (footer && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => btn.classList.toggle('tour-toggle--hidden', entry.isIntersecting),
        { rootMargin: '0px' }
      );
      observer.observe(footer);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const pageKey = document.body.dataset.tourPage;
    const steps = STEPS_BY_PAGE[pageKey];
    if (!steps || !steps.length) return;
    buildButton(steps);
  });
})();
