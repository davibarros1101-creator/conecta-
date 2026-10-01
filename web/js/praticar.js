/**
 * Fluxo de prática do Conecta+: Observe -> Decida -> Aprenda, uma situação
 * de cada vez, com resultado final e comparação com a tentativa anterior
 * (guardada em localStorage, só nesse navegador/aparelho).
 */
(function () {
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_SPEAKER = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  const ICON_SPEAKER_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  // Leitura em voz alta da mensagem - ajuda quem tem dificuldade de leitura
  // na tela. Usa a função de fala já embutida no navegador, sem precisar de
  // nenhum serviço externo.
  //
  // Achado real: o botão podia "não funcionar" (clicar e não sair som) sem
  // nenhum aviso, porque a lista de vozes do navegador carrega de forma
  // assíncrona (pode vir vazia no primeiro clique) e, se o Windows não tem
  // nenhuma voz em português instalada, o navegador às vezes falha calado
  // em vez de avisar. As correções: espera a lista de vozes carregar antes
  // de falar, escolhe a melhor voz em português disponível (sem travar se
  // não achar nenhuma), e mostra uma mensagem visível se a fala falhar de
  // verdade, em vez de só o ícone voltar ao normal sem explicação.
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

  function mostrarErroLeitura(btn, mensagem) {
    let aviso = btn.parentElement.querySelector('[data-listen-erro]');
    if (!aviso) {
      aviso = document.createElement('span');
      aviso.setAttribute('data-listen-erro', '');
      aviso.className = 'message-bubble__listen-erro';
      btn.parentElement.appendChild(aviso);
    }
    aviso.textContent = mensagem;
    setTimeout(() => aviso.remove(), 6000);
  }

  async function lerEmVozAlta(texto, btn) {
    if (!falaDisponivel) {
      mostrarErroLeitura(btn, 'Esse navegador não tem leitura em voz alta disponível.');
      return;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      btn.innerHTML = ICON_SPEAKER;
      btn.setAttribute('aria-label', 'Ouvir a mensagem');
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
    function resetar() {
      if (terminou) return;
      terminou = true;
      btn.innerHTML = ICON_SPEAKER;
      btn.setAttribute('aria-label', 'Ouvir a mensagem');
    }
    utter.onend = resetar;
    utter.onerror = (e) => {
      resetar();
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        mostrarErroLeitura(btn, voz ? 'Não foi possível ouvir agora. Tente de novo.' : 'Esse navegador não tem uma voz em português instalada.');
      }
    };
    btn.innerHTML = ICON_SPEAKER_OFF;
    btn.setAttribute('aria-label', 'Parar a leitura');
    window.speechSynthesis.speak(utter);

    // Segurança: em alguns navegadores sem nenhuma voz instalada, nem
    // onend nem onerror disparam e o botão ficava travado pra sempre em
    // "Parar a leitura" (achado real, reproduzido em teste automatizado).
    // Se não terminou sozinho em tempo razoável pro tamanho do texto,
    // força o reset e avisa.
    const tempoEsperado = Math.max(4000, texto.length * 90);
    setTimeout(() => {
      if (!terminou) {
        window.speechSynthesis.cancel();
        resetar();
        mostrarErroLeitura(btn, 'Não conseguimos ouvir essa mensagem. Seu navegador pode não ter voz em português.');
      }
    }, tempoEsperado);
  }

  const HISTORICO_KEY = 'conectaMais:historico';
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

  function atualizarProgresso() {
    const pct = Math.round((indice / total) * 100);
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = `Situação ${Math.min(indice + 1, total)} de ${total}`;
  }

  function renderSituacao() {
    respondida = false;
    const s = situacoes[indice];
    atualizarProgresso();
    app.innerHTML = `
      <div class="scenario-card">
        <div class="scenario-card__meta">
          <span class="scenario-card__badge">${esc(s.categoria)}</span>
          <span class="scenario-card__badge">${esc(s.canal)}</span>
        </div>
        <p class="scenario-card__question">Observe a mensagem abaixo:</p>
        <div class="message-bubble">
          <div class="message-bubble__head">
            <span class="message-bubble__sender">De: ${esc(s.remetente)}</span>
            ${falaDisponivel ? `<button type="button" class="message-bubble__listen" data-listen-btn aria-label="Ouvir a mensagem">${ICON_SPEAKER}</button>` : ''}
          </div>
          ${esc(s.mensagem)}
        </div>
        <p class="scenario-card__question"><strong>Essa mensagem parece um golpe?</strong></p>
        <div class="decision-buttons">
          <button type="button" class="decision-btn decision-btn--sim" data-resp="sim">${ICON_CHECK} SIM</button>
          <button type="button" class="decision-btn decision-btn--nao" data-resp="nao">${ICON_X} NÃO</button>
        </div>
        <div data-feedback-slot></div>
      </div>
    `;
    app.querySelectorAll('[data-resp]').forEach((btn) => {
      btn.addEventListener('click', () => responder(btn.dataset.resp === 'sim'));
    });
    const listenBtn = app.querySelector('[data-listen-btn]');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => lerEmVozAlta(s.mensagem, listenBtn));
    }
  }

  function responder(respondeuGolpe) {
    if (respondida) return;
    respondida = true;
    const s = situacoes[indice];
    const acertou = respondeuGolpe === s.isGolpe;
    respostas.push({ id: s.id, acertou });

    app.querySelectorAll('[data-resp]').forEach((btn) => { btn.disabled = true; });

    const sinaisHtml = s.sinais.length
      ? `<p style="margin:0 0 0.5rem; font-weight:700; display:flex; align-items:center; gap:0.4rem;">${ICON_ALERT} Sinais de alerta:</p><ul class="feedback__sinais">${s.sinais.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
      : '';

    const slot = app.querySelector('[data-feedback-slot]');
    slot.innerHTML = `
      <div class="feedback ${acertou ? 'feedback--correta' : 'feedback--errada'}">
        <p class="feedback__title">${acertou ? ICON_CHECK + ' Você acertou!' : ICON_X + ' Não foi dessa vez.'} ${s.isGolpe ? 'É um golpe.' : 'Não é um golpe.'}</p>
        <p class="feedback__text">${esc(s.explicacao)}</p>
        ${sinaisHtml}
        <button type="button" class="btn btn-primary btn-block" data-proxima>${indice + 1 < total ? 'Próxima situação' : 'Ver resultado'}</button>
      </div>
    `;
    slot.querySelector('[data-proxima]').addEventListener('click', avancar);
    slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function avancar() {
    if (falaDisponivel) window.speechSynthesis.cancel();
    indice += 1;
    if (indice >= total) {
      finalizar();
    } else {
      renderSituacao();
    }
  }

  function lerHistorico() {
    try {
      return JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function salvarHistorico(registro) {
    try {
      const hist = lerHistorico();
      hist.push(registro);
      localStorage.setItem(HISTORICO_KEY, JSON.stringify(hist.slice(-10)));
    } catch { /* localStorage indisponível, segue sem guardar */ }
  }

  function finalizar() {
    const acertos = respostas.filter((r) => r.acertou).length;
    const historicoAnterior = lerHistorico();
    const tentativaAnterior = historicoAnterior[historicoAnterior.length - 1] || null;

    salvarHistorico({ data: new Date().toISOString(), acertos, total });
    if (typeof registrarAtividade === 'function') registrarAtividade('pratica', { acertos, total });

    progressFill.style.width = '100%';
    progressLabel.textContent = 'Concluído!';

    let comparacaoHtml = '';
    if (tentativaAnterior) {
      const diff = acertos - tentativaAnterior.acertos;
      const msg = diff > 0
        ? `Você melhorou! Foram ${diff} acerto(s) a mais que na última vez.`
        : diff < 0
          ? 'Dessa vez você acertou um pouco menos que na última tentativa. Sem problema, continue praticando.'
          : 'Você repetiu o mesmo resultado da última tentativa.';
      comparacaoHtml = `
        <div class="result-card__compare">
          <p style="margin:0;"><strong>Tentativa anterior:</strong> ${tentativaAnterior.acertos} de ${tentativaAnterior.total} · <strong>Agora:</strong> ${acertos} de ${total}</p>
          <p style="margin:0.4rem 0 0;">${msg}</p>
        </div>
      `;
    }

    const mensagemFinal = acertos === total
      ? 'Excelente! Você identificou todas as situações corretamente.'
      : acertos >= total * 0.7
        ? 'Muito bem! Você já consegue identificar a maioria dos sinais de golpe.'
        : 'Você já consegue identificar vários sinais de golpes. Continue praticando para ficar ainda mais seguro.';

    app.innerHTML = `
      <div class="scenario-card result-card">
        <p class="scenario-card__question" style="margin-bottom:0;">Você acertou</p>
        <p class="result-card__score">${acertos} de ${total}</p>
        <p>${esc(mensagemFinal)}</p>
        ${comparacaoHtml}
        <div class="result-card__actions">
          <button type="button" class="btn btn-primary" data-refazer>Praticar de novo</button>
          <a class="btn btn-outline--light" href="historico.html">Ver meu progresso</a>
          <a class="btn btn-outline--light" href="index.html">Voltar ao início</a>
        </div>
      </div>
    `;
    app.querySelector('[data-refazer]').addEventListener('click', () => window.location.reload());
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderSituacao();
})();
