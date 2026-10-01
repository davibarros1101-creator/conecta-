/**
 * Mesmo fluxo de prática do site (Observe -> Decida -> Aprenda), adaptado
 * pro popup compacto da extensão. Usa o mesmo scenarios.js do site (cópia
 * local, já que uma extensão não acessa arquivos fora da própria pasta).
 */
(function () {
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_SPEAKER = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
  const ICON_SPEAKER_OFF = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  const falaDisponivel = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  function obterVozesQuandoProntas() {
    return new Promise((resolve) => {
      const vozes = window.speechSynthesis.getVoices();
      if (vozes.length) { resolve(vozes); return; }
      const timeout = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        clearTimeout(timeout);
        resolve(window.speechSynthesis.getVoices());
      }, { once: true });
    });
  }

  function escolherVozPortugues(vozes) {
    return vozes.find((v) => v.lang === 'pt-BR')
      || vozes.find((v) => v.lang && v.lang.toLowerCase().startsWith('pt'))
      || null;
  }

  async function lerEmVozAlta(texto, btn) {
    if (!falaDisponivel) return;
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      btn.innerHTML = ICON_SPEAKER;
      return;
    }
    btn.disabled = true;
    const vozes = await obterVozesQuandoProntas();
    btn.disabled = false;

    const utter = new SpeechSynthesisUtterance(texto);
    const voz = escolherVozPortugues(vozes);
    if (voz) utter.voice = voz;
    utter.lang = 'pt-BR';
    utter.rate = 0.95;
    let terminou = false;
    function resetar() { if (!terminou) { terminou = true; btn.innerHTML = ICON_SPEAKER; } }
    utter.onend = resetar;
    utter.onerror = resetar;
    btn.innerHTML = ICON_SPEAKER_OFF;
    window.speechSynthesis.speak(utter);
    setTimeout(() => { if (!terminou) { window.speechSynthesis.cancel(); resetar(); } }, Math.max(4000, texto.length * 90));
  }

  const HISTORICO_KEY = 'conectaMaisExt:historico';
  const app = document.querySelector('[data-app]');
  const progressFill = document.querySelector('[data-progress-fill]');
  const progressLabel = document.querySelector('[data-progress-label]');

  function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  const situacoes = embaralhar(SCENARIOS);
  const total = situacoes.length;
  let indice = 0;
  let respondida = false;
  const respostas = [];

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function atualizarProgresso() {
    const pct = Math.round((indice / total) * 100);
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = `${Math.min(indice + 1, total)} de ${total}`;
  }

  function renderSituacao() {
    respondida = false;
    const s = situacoes[indice];
    atualizarProgresso();
    app.innerHTML = `
      <div class="meta">
        <span class="badge">${esc(s.categoria)}</span>
        <span class="badge">${esc(s.canal)}</span>
      </div>
      <p class="question">Observe a mensagem:</p>
      <div class="bubble">
        <div class="bubble__head">
          <span class="bubble__sender">De: ${esc(s.remetente)}</span>
          ${falaDisponivel ? `<button type="button" class="bubble__listen" data-listen-btn aria-label="Ouvir a mensagem">${ICON_SPEAKER}</button>` : ''}
        </div>
        ${esc(s.mensagem)}
      </div>
      <p class="question"><strong>Essa mensagem parece um golpe?</strong></p>
      <div class="decisions">
        <button type="button" class="decision-btn decision-btn--sim" data-resp="sim">${ICON_CHECK} SIM</button>
        <button type="button" class="decision-btn decision-btn--nao" data-resp="nao">${ICON_X} NÃO</button>
      </div>
      <div data-feedback-slot></div>
    `;
    app.querySelectorAll('[data-resp]').forEach((btn) => {
      btn.addEventListener('click', () => responder(btn.dataset.resp === 'sim'));
    });
    const listenBtn = app.querySelector('[data-listen-btn]');
    if (listenBtn) listenBtn.addEventListener('click', () => lerEmVozAlta(s.mensagem, listenBtn));
  }

  function responder(respondeuGolpe) {
    if (respondida) return;
    respondida = true;
    const s = situacoes[indice];
    const acertou = respondeuGolpe === s.isGolpe;
    respostas.push({ id: s.id, acertou });
    app.querySelectorAll('[data-resp]').forEach((btn) => { btn.disabled = true; });

    const sinaisHtml = s.sinais.length
      ? `<p style="margin:0 0 0.3rem; font-weight:700; font-size:0.82rem; display:flex; align-items:center; gap:0.35rem;">${ICON_ALERT} Sinais de alerta:</p><ul class="feedback__sinais">${s.sinais.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
      : '';

    const slot = app.querySelector('[data-feedback-slot]');
    slot.innerHTML = `
      <div class="feedback ${acertou ? 'feedback--correta' : 'feedback--errada'}">
        <p class="feedback__title">${acertou ? ICON_CHECK + ' Acertou!' : ICON_X + ' Não foi dessa vez.'} ${s.isGolpe ? 'É golpe.' : 'Não é golpe.'}</p>
        <p class="feedback__text">${esc(s.explicacao)}</p>
        ${sinaisHtml}
        <button type="button" class="btn" data-proxima>${indice + 1 < total ? 'Próxima situação' : 'Ver resultado'}</button>
      </div>
    `;
    slot.querySelector('[data-proxima]').addEventListener('click', avancar);
  }

  function avancar() {
    if (falaDisponivel) window.speechSynthesis.cancel();
    indice += 1;
    if (indice >= total) finalizar();
    else renderSituacao();
  }

  function lerHistorico() {
    try { return JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]'); } catch { return []; }
  }
  function salvarHistorico(registro) {
    try {
      const hist = lerHistorico();
      hist.push(registro);
      localStorage.setItem(HISTORICO_KEY, JSON.stringify(hist.slice(-10)));
    } catch { /* sem storage disponível, segue sem guardar */ }
  }

  function finalizar() {
    const acertos = respostas.filter((r) => r.acertou).length;
    const anterior = lerHistorico().slice(-1)[0] || null;
    salvarHistorico({ data: new Date().toISOString(), acertos, total });

    progressFill.style.width = '100%';
    progressLabel.textContent = 'Concluído!';

    let compareHtml = '';
    if (anterior) {
      compareHtml = `<div class="result__compare"><strong>Última vez:</strong> ${anterior.acertos} de ${anterior.total} · <strong>Agora:</strong> ${acertos} de ${total}</div>`;
    }

    app.innerHTML = `
      <div class="result">
        <p class="question" style="margin-bottom:0;">Você acertou</p>
        <p class="result__score">${acertos} de ${total}</p>
        ${compareHtml}
        <button type="button" class="btn" data-refazer>Praticar de novo</button>
      </div>
    `;
    app.querySelector('[data-refazer]').addEventListener('click', () => window.location.reload());
  }

  const verificarBtn = document.querySelector('[data-abrir-verificar]');
  if (verificarBtn) {
    verificarBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('verificar.html') });
    });
  }

  const verificarRostoBtn = document.querySelector('[data-abrir-verificar-rosto]');
  if (verificarRostoBtn) {
    verificarRostoBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('verificar-rosto.html') });
    });
  }

  renderSituacao();
})();
