/**
 * Tela "Verificar mensagem": lê o texto de um print via OCR (Tesseract.js,
 * roda no navegador, a imagem nunca sai do computador da pessoa) ou usa o
 * texto colado direto, e analisa com scamDetector.js.
 */
(function () {
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_ALERT_TRIANGLE = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>';
  const ICON_ALERT_OCTAGON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_FLAG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';
  const ICON_MEGAPHONE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>';

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

  // Se o navegador não conseguir mostrar a imagem (ex.: formato HEIC de
  // iPhone, que o Chrome/Edge no Windows não decodifica), avisa em vez de
  // deixar o ícone de imagem quebrada sem explicação - o OCR também não
  // vai funcionar nesse caso, então orienta a converter ou tirar um print
  // novo em vez de uma foto.
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

  // Colar print direto (Ctrl+V) também funciona, útil pra quem copiou um
  // print da área de transferência sem salvar o arquivo antes.
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
        ? 'Essa imagem tem características de um boleto ou conta de verdade (código de barras, linha digitável, CNPJ ou vencimento) e não tem nenhum sinal comum de golpe. Mesmo assim, se tiver qualquer dúvida, confira o valor e os dados direto no aplicativo oficial da empresa.'
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
      </div>
      ${textoHtml}
    `;
    resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
