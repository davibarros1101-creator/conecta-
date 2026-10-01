/**
 * Igual ao web/js/verificar.js do site, só que usando os arquivos do
 * Tesseract.js empacotados localmente dentro da extensão (pasta
 * tesseract/) em vez de baixar de um CDN - o Manifest V3 não deixa uma
 * extensão carregar script remoto por padrão, então tudo precisa estar
 * dentro da própria pasta da extensão.
 */
(function () {
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_ALERT_TRIANGLE = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';
  const ICON_ALERT_OCTAGON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_FLAG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';
  const ICON_MEGAPHONE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px; margin-right:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>';

  function compartilharResultado(titulo, descricao) {
    const texto = `Verifiquei uma mensagem suspeita no Conecta+ e o resultado foi: "${titulo}". ${descricao}\n\nVocê também pode verificar mensagens suspeitas: https://conecta-mais-theta.vercel.app/verificar.html`;
    if (navigator.share) {
      navigator.share({ text: texto }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    }
  }

  const tabs = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');
  const uploadArea = document.querySelector('[data-upload-area]');
  const fileInput = document.querySelector('[data-file-input]');
  const previewWrap = document.querySelector('[data-preview-wrap]');
  const preview = document.querySelector('[data-preview]');
  const removeBtn = document.querySelector('[data-remove-btn]');
  const textInput = document.querySelector('[data-text-input]');
  const analisarBtn = document.querySelector('[data-analisar-btn]');
  const statusEl = document.querySelector('[data-status]');
  const resultadoEl = document.querySelector('[data-resultado]');

  let abaAtiva = 'imagem';
  let arquivoSelecionado = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      abaAtiva = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) => { p.hidden = p.dataset.panel !== abaAtiva; });
      atualizarBotao();
    });
  });

  function atualizarBotao() {
    if (abaAtiva === 'imagem') {
      analisarBtn.disabled = !arquivoSelecionado;
    } else {
      analisarBtn.disabled = !textInput.value.trim();
    }
  }

  textInput.addEventListener('input', atualizarBotao);

  function limparArquivo() {
    arquivoSelecionado = null;
    preview.src = '';
    previewWrap.hidden = true;
    fileInput.value = '';
    setStatus(null);
    resultadoEl.hidden = true;
    atualizarBotao();
  }

  function selecionarArquivo(file) {
    if (!file || !file.type.startsWith('image/')) return;
    arquivoSelecionado = file;
    resultadoEl.hidden = true;
    const url = URL.createObjectURL(file);
    preview.src = url;
    previewWrap.hidden = false;
    setStatus(null);
    atualizarBotao();
  }

  preview.addEventListener('error', () => {
    if (!arquivoSelecionado) return;
    previewWrap.hidden = true;
    setStatus('<span>Não conseguimos abrir essa imagem (o formato pode não ser compatível, como HEIC de iPhone). Tente converter para JPG ou PNG, ou enviar um print de tela em vez de uma foto.</span>');
    arquivoSelecionado = null;
    atualizarBotao();
  });

  removeBtn.addEventListener('click', limparArquivo);

  fileInput.addEventListener('change', (e) => selecionarArquivo(e.target.files[0]));

  ['dragover', 'dragenter'].forEach((evt) => {
    uploadArea.addEventListener(evt, (e) => { e.preventDefault(); uploadArea.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach((evt) => {
    uploadArea.addEventListener(evt, (e) => { e.preventDefault(); uploadArea.classList.remove('is-dragover'); });
  });
  uploadArea.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    selecionarArquivo(file);
  });

  document.addEventListener('paste', (e) => {
    if (abaAtiva !== 'imagem') return;
    const item = Array.from(e.clipboardData.items || []).find((i) => i.type.startsWith('image/'));
    if (item) selecionarArquivo(item.getAsFile());
  });

  function setStatus(html) {
    if (!html) { statusEl.hidden = true; statusEl.innerHTML = ''; return; }
    statusEl.hidden = false;
    statusEl.innerHTML = html;
  }

  async function extrairTextoDaImagem(file) {
    setStatus('<div class="spinner"></div><span>Lendo o print (isso pode levar alguns segundos)…</span>');
    const { data } = await Tesseract.recognize(file, 'por', {
      workerPath: chrome.runtime.getURL('tesseract/worker.min.js'),
      corePath: chrome.runtime.getURL('tesseract/core/'),
      langPath: chrome.runtime.getURL('tesseract/lang/'),
      cacheMethod: 'none',
      // Por padrao o Tesseract.js cria o worker através de um Blob
      // intermediário (new Blob(['importScripts("worker.min.js")'])), e
      // esse import de dentro do blob é bloqueado pela política de
      // segurança do Manifest V3 mesmo com o arquivo sendo local. Com
      // workerBlobURL:false ele cria o worker direto (new
      // Worker(workerPath)), sem essa camada extra - funciona certinho
      // dentro da extensão.
      workerBlobURL: false,
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          setStatus(`<div class="spinner"></div><span>Lendo o print… ${pct}%</span>`);
        }
      },
    });
    return data.text;
  }

  function renderResultado(resultado, textoExtraidoDeImagem) {
    const config = resultado.pareceDocumentoOficial
      ? { classe: 'baixo', icone: ICON_CHECK, titulo: 'Parece uma conta ou documento oficial' }
      : {
          alto: { classe: 'alto', icone: ICON_ALERT_OCTAGON, titulo: 'Sinais fortes de golpe' },
          atencao: { classe: 'atencao', icone: ICON_ALERT_TRIANGLE, titulo: 'Alguns sinais de atenção' },
          baixo: { classe: 'baixo', icone: ICON_CHECK, titulo: 'Não encontramos sinais claros de golpe' },
        }[resultado.riscoGolpe];

    const descPorRisco = {
      alto: 'Essa mensagem tem várias características comuns em golpes. Não clique em links, não pague nada e não informe dados antes de confirmar por outro meio (ligue direto pro número oficial da empresa, por exemplo).',
      atencao: 'Encontramos pelo menos um sinal que merece atenção. Não é certeza de golpe, mas vale desconfiar e confirmar antes de agir.',
      baixo: resultado.pareceDocumentoOficial
        ? 'Essa imagem tem características de um boleto ou conta de verdade (código de barras, linha digitável, CNPJ ou vencimento) e não tem nenhum sinal comum de golpe. Mas atenção: existe o golpe do "boleto clonado", em que o golpista copia a conta de luz, água ou outra empresa e troca só o código de barras e o beneficiário, pra receber o pagamento na conta dele. Antes de pagar, confira se o nome da empresa no código de barras é mesmo o da concessionária, e se o boleto tem a parte de baixo completa (código de barras e opção de débito automático) igual aos boletos anteriores.'
        : 'Não identificamos os sinais mais comuns de golpe nessa mensagem. Mesmo assim, sempre desconfie de pedidos de dinheiro ou de dados pessoais.',
    };

    const sinaisHtml = resultado.sinais.length
      ? `<ul class="sinais-encontrados">${resultado.sinais.map((s) => `<li>${ICON_FLAG}${esc(s)}</li>`).join('')}</ul>`
      : '';

    const spamHtml = resultado.possivelSpam
      ? `<span class="spam-tag">${ICON_MEGAPHONE} Possível spam</span>`
      : '';

    const textoHtml = textoExtraidoDeImagem
      ? `<details class="extracted-text"><summary>Ver o texto que a gente leu no print</summary><p>${esc(resultado.texto)}</p></details>`
      : '';

    resultadoEl.hidden = false;
    resultadoEl.innerHTML = `
      <div class="result-risk result-risk--${config.classe}">
        <p class="result-risk__title">${config.icone} ${config.titulo}</p>
        <p class="result-risk__desc">${descPorRisco[resultado.riscoGolpe]}</p>
        ${spamHtml}
        ${sinaisHtml}
        <button type="button" class="btn btn-outline--light" data-compartilhar-btn style="margin-top:0.5rem;">${ICON_SHARE} Compartilhar resultado</button>
      </div>
      ${textoHtml}
    `;
    resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const compartilharBtn = resultadoEl.querySelector('[data-compartilhar-btn]');
    if (compartilharBtn) {
      compartilharBtn.addEventListener('click', () => {
        compartilharResultado(config.titulo, descPorRisco[resultado.riscoGolpe]);
      });
    }
  }

  analisarBtn.addEventListener('click', async () => {
    analisarBtn.disabled = true;
    resultadoEl.hidden = true;
    try {
      let texto;
      let veioDeImagem = false;
      if (abaAtiva === 'imagem') {
        if (!arquivoSelecionado) return;
        texto = await extrairTextoDaImagem(arquivoSelecionado);
        veioDeImagem = true;
      } else {
        texto = textInput.value;
      }

      const resultado = analisarTexto(texto);
      setStatus(null);

      if (resultado.vazio || !resultado.texto || resultado.texto.length < 8) {
        setStatus('<span>Não conseguimos ler texto suficiente nessa imagem. Tente um print mais nítido, com o texto bem visível, ou cole o texto manualmente na aba "Colar o texto".</span>');
        return;
      }

      renderResultado(resultado, veioDeImagem);
    } catch (err) {
      setStatus(`<span>Não foi possível analisar agora (${esc(err.message || 'erro desconhecido')}). Tente de novo.</span>`);
    } finally {
      atualizarBotao();
    }
  });
})();
