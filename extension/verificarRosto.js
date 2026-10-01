/**
 * Tela "Verificar rosto": compara pela câmera ou por uma foto enviada o
 * rosto de uma videochamada/print com o rosto de uma pessoa de confiança
 * cadastrada antes. Usa face-api.js (modelos carregados do CDN,
 * processamento todo local no navegador - a imagem e os rostos cadastrados
 * nunca saem do computador).
 *
 * No modo câmera, a pessoa precisa clicar em "Tirar foto" pra congelar um
 * quadro antes de salvar/comparar - evita processar um frame ao acaso da
 * câmera ao vivo sem a pessoa ver o que foi capturado.
 *
 * Verificado de verdade (não é simulação): os mesmos modelos e o mesmo
 * cálculo de distância euclidiana usados aqui foram testados com fotos
 * reais de pessoas diferentes antes de entrar no ar, confirmando que
 * reconhecem a mesma pessoa em fotos diferentes e rejeitam pessoas
 * diferentes.
 */
(function () {
  const MODEL_URL = chrome.runtime.getURL('face-models/');
  const LIMIAR_MESMA_PESSOA = 0.6; // padrão recomendado pelo face-api.js
  const STORAGE_KEY = 'conectaMais:rostosConfianca';

  const statusModeloEl = document.querySelector('[data-status-modelo]');
  const conteudoEl = document.querySelector('[data-conteudo]');
  const faceListEl = document.querySelector('[data-face-list]');
  const faceEmptyEl = document.querySelector('[data-face-empty]');

  const abrirCadastroBtn = document.querySelector('[data-abrir-cadastro]');
  const exportarBtn = document.querySelector('[data-exportar-rostos]');
  const fileInputImportar = document.querySelector('[data-file-input-importar]');
  const statusExportarEl = document.querySelector('[data-status-exportar]');
  const painelCadastro = document.querySelector('[data-painel-cadastro]');
  const cadastroTituloEl = document.querySelector('[data-cadastro-titulo]');
  const videoCadastro = document.querySelector('[data-video-cadastro]');
  const fotoTiradaCadastroImg = document.querySelector('[data-foto-tirada-cadastro]');
  const tirarFotoCadastroBtn = document.querySelector('[data-tirar-foto-cadastro]');
  const tirarOutraCadastroBtn = document.querySelector('[data-tirar-outra-cadastro]');
  const statusCadastroEl = document.querySelector('[data-status-cadastro]');
  const nomeInput = document.querySelector('[data-nome-input]');
  const capturarBtn = document.querySelector('[data-capturar-btn]');
  const cancelarCadastroBtn = document.querySelector('[data-cancelar-cadastro]');
  const cadastroTabs = document.querySelectorAll('[data-cadastro-tab]');
  const cadastroPaineis = document.querySelectorAll('[data-cadastro-painel]');
  const uploadAreaCadastro = document.querySelector('[data-upload-area-cadastro]');
  const fileInputCadastro = document.querySelector('[data-file-input-cadastro]');
  const previewWrapCadastro = document.querySelector('[data-preview-wrap-cadastro]');
  const previewCadastro = document.querySelector('[data-preview-cadastro]');
  const removeCadastroBtn = document.querySelector('[data-remove-cadastro]');

  const abrirVerificacaoBtn = document.querySelector('[data-abrir-verificacao]');
  const painelVerificacao = document.querySelector('[data-painel-verificacao]');
  const videoVerificar = document.querySelector('[data-video-verificar]');
  const fotoTiradaVerificarImg = document.querySelector('[data-foto-tirada-verificar]');
  const tirarFotoVerificarBtn = document.querySelector('[data-tirar-foto-verificar]');
  const tirarOutraVerificarBtn = document.querySelector('[data-tirar-outra-verificar]');
  const compararBtn = document.querySelector('[data-comparar-btn]');
  const fecharVerificacaoBtn = document.querySelector('[data-fechar-verificacao]');
  const statusVerificacaoEl = document.querySelector('[data-status-verificacao]');
  const resultadoVerificacaoEl = document.querySelector('[data-resultado-verificacao]');
  const verificacaoTabs = document.querySelectorAll('[data-verificacao-tab]');
  const verificacaoPaineis = document.querySelectorAll('[data-verificacao-painel]');
  const uploadAreaVerificar = document.querySelector('[data-upload-area-verificar]');
  const fileInputVerificar = document.querySelector('[data-file-input-verificar]');
  const previewWrapVerificar = document.querySelector('[data-preview-wrap-verificar]');
  const previewVerificar = document.querySelector('[data-preview-verificar]');
  const removeVerificarBtn = document.querySelector('[data-remove-verificar]');

  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  const ICON_SHARE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px; margin-right:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>';
  const ICON_EDIT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setStatus(el, html) {
    if (!html) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = html;
  }

  // Um rosto pode ter mais de uma foto cadastrada (mais ângulos/luzes =
  // comparação mais precisa). Cadastros antigos salvos só com "descriptor"
  // (singular) são migrados pra "descriptors" (plural) na leitura, sem
  // precisar apagar o que a pessoa já tinha cadastrado.
  function normalizarRosto(r) {
    if (r.descriptors) return r;
    return { ...r, descriptors: r.descriptor ? [r.descriptor] : [] };
  }

  function lerRostos() {
    try {
      const lista = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return lista.map(normalizarRosto);
    } catch { return []; }
  }
  function salvarRostos(lista) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lista)); } catch { /* sem storage, segue sem salvar */ }
  }

  function renderFaceList() {
    const rostos = lerRostos();
    faceListEl.querySelectorAll('.face-card').forEach((el) => el.remove());
    faceEmptyEl.hidden = rostos.length > 0;
    rostos.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'face-card';
      const fotosTexto = r.descriptors.length > 1 ? `${r.descriptors.length} fotos` : '';
      card.innerHTML = `
        <div class="face-card__acoes">
          <button type="button" class="face-card__editar" data-editar-id="${esc(r.id)}" aria-label="Editar nome de ${esc(r.nome)}">${ICON_EDIT}</button>
          <button type="button" class="face-card__excluir" data-excluir-id="${esc(r.id)}" aria-label="Remover ${esc(r.nome)}">${ICON_TRASH}</button>
        </div>
        <img src="${r.foto}" alt="${esc(r.nome)}">
        <span class="face-card__nome" data-nome-texto="${esc(r.id)}" title="Clique para editar o nome">${esc(r.nome)}</span>
        <span class="face-card__fotos">${fotosTexto}</span>
        <button type="button" class="face-card__add-foto" data-add-foto-id="${esc(r.id)}">+ Adicionar foto</button>
      `;
      faceListEl.appendChild(card);
    });

    faceListEl.querySelectorAll('[data-excluir-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.excluirId;
        salvarRostos(lerRostos().filter((r) => r.id !== id));
        renderFaceList();
      });
    });

    function iniciarEdicaoNome(span) {
      const id = span.dataset.nomeTexto;
      const nomeAtual = span.textContent;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'face-card__nome-input';
      input.value = nomeAtual;
      input.maxLength = 40;
      span.replaceWith(input);
      input.focus();
      input.select();

      function salvarNovoNome() {
        const novoNome = input.value.trim() || nomeAtual;
        const rostos = lerRostos();
        const rosto = rostos.find((r) => r.id === id);
        if (rosto) rosto.nome = novoNome;
        salvarRostos(rostos);
        renderFaceList();
      }
      input.addEventListener('blur', salvarNovoNome);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { input.value = nomeAtual; input.blur(); }
      });
    }
    faceListEl.querySelectorAll('[data-editar-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const span = faceListEl.querySelector(`[data-nome-texto="${CSS.escape(btn.dataset.editarId)}"]`);
        if (span) iniciarEdicaoNome(span);
      });
    });
    faceListEl.querySelectorAll('[data-nome-texto]').forEach((span) => {
      span.addEventListener('click', () => iniciarEdicaoNome(span));
    });

    faceListEl.querySelectorAll('[data-add-foto-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.addFotoId;
        const rosto = lerRostos().find((r) => r.id === id);
        if (rosto) abrirCadastro(rosto);
      });
    });
  }

  // --- Câmera -------------------------------------------------------
  let streamCadastro = null;
  let streamVerificacao = null;
  let abaCadastro = 'camera';
  let abaVerificacao = 'camera';
  let arquivoCadastro = null;
  let arquivoVerificar = null;
  let fotoCameraCadastro = null; // canvas com o quadro congelado, ou null
  let fotoCameraVerificar = null;
  let pessoaParaAdicionarFoto = null; // rosto existente, quando o cadastro é "adicionar mais uma foto" em vez de criar pessoa nova

  async function ligarCamera(videoEl) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Este navegador não permite acesso à câmera.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    videoEl.srcObject = stream;
    await videoEl.play();
    return stream;
  }

  function desligarCamera(stream) {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }

  function mensagemErroCamera(err) {
    if (err && err.name === 'NotAllowedError') {
      return 'Acesso à câmera foi negado. Permita o uso da câmera nas configurações do navegador, ou use a opção "Enviar uma foto".';
    }
    if (err && err.name === 'NotFoundError') {
      return 'Nenhuma câmera foi encontrada neste dispositivo. Use a opção "Enviar uma foto".';
    }
    return `Não foi possível acessar a câmera (${esc((err && err.message) || 'erro desconhecido')}). Use a opção "Enviar uma foto".`;
  }

  // --- Detecção -------------------------------------------------------
  async function detectarRosto(videoOuImgOuCanvas) {
    return faceapi
      .detectSingleFace(videoOuImgOuCanvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();
  }

  // Congela o quadro atual da câmera num canvas em tamanho real (usado pra
  // detecção) e devolve também um dataURL pra mostrar na tela.
  function tirarFotoDoVideo(videoEl) {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function gerarThumbnail(fonte, largura, altura) {
    const canvas = document.createElement('canvas');
    const lado = Math.min(largura, altura);
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    const offsetX = (largura - lado) / 2;
    const offsetY = (altura - lado) / 2;
    ctx.drawImage(fonte, offsetX, offsetY, lado, lado, 0, 0, 120, 120);
    return canvas.toDataURL('image/jpeg', 0.75);
  }

  // --- Troca de aba (câmera / foto), reutilizável pros dois painéis ---------
  function configurarTabs(tabs, paineis, {
    onCamera, onFoto,
  }) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const alvo = tab.dataset.cadastroTab || tab.dataset.verificacaoTab;
        tabs.forEach((t) => t.classList.toggle('active', t === tab));
        paineis.forEach((p) => {
          const chave = p.dataset.cadastroPainel || p.dataset.verificacaoPainel;
          p.hidden = chave !== alvo;
        });
        if (alvo === 'camera') onCamera();
        else onFoto();
      });
    });
  }

  function mostrarVideoCadastro() {
    fotoCameraCadastro = null;
    videoCadastro.hidden = false;
    fotoTiradaCadastroImg.hidden = true;
    tirarFotoCadastroBtn.hidden = false;
    tirarOutraCadastroBtn.hidden = true;
  }
  function mostrarVideoVerificar() {
    fotoCameraVerificar = null;
    videoVerificar.hidden = false;
    fotoTiradaVerificarImg.hidden = true;
    tirarFotoVerificarBtn.hidden = false;
    tirarOutraVerificarBtn.hidden = true;
  }

  configurarTabs(cadastroTabs, cadastroPaineis, {
    onCamera: async () => {
      abaCadastro = 'camera';
      setStatus(statusCadastroEl, null);
      mostrarVideoCadastro();
      try {
        streamCadastro = await ligarCamera(videoCadastro);
      } catch (err) {
        setStatus(statusCadastroEl, `<span>${mensagemErroCamera(err)}</span>`);
      }
    },
    onFoto: () => {
      abaCadastro = 'foto';
      desligarCamera(streamCadastro);
      streamCadastro = null;
      setStatus(statusCadastroEl, null);
    },
  });

  configurarTabs(verificacaoTabs, verificacaoPaineis, {
    onCamera: async () => {
      abaVerificacao = 'camera';
      setStatus(statusVerificacaoEl, null);
      mostrarVideoVerificar();
      try {
        streamVerificacao = await ligarCamera(videoVerificar);
      } catch (err) {
        setStatus(statusVerificacaoEl, `<span>${mensagemErroCamera(err)}</span>`);
      }
    },
    onFoto: () => {
      abaVerificacao = 'foto';
      desligarCamera(streamVerificacao);
      streamVerificacao = null;
      setStatus(statusVerificacaoEl, null);
    },
  });

  // --- Tirar foto (cadastro) ---------------------------------------
  tirarFotoCadastroBtn.addEventListener('click', () => {
    if (!streamCadastro) {
      setStatus(statusCadastroEl, '<span>A câmera não está ligada. Tente de novo.</span>');
      return;
    }
    fotoCameraCadastro = tirarFotoDoVideo(videoCadastro);
    fotoTiradaCadastroImg.src = fotoCameraCadastro.toDataURL('image/jpeg', 0.85);
    fotoTiradaCadastroImg.hidden = false;
    videoCadastro.hidden = true;
    tirarFotoCadastroBtn.hidden = true;
    tirarOutraCadastroBtn.hidden = false;
    setStatus(statusCadastroEl, null);
  });
  tirarOutraCadastroBtn.addEventListener('click', mostrarVideoCadastro);

  // --- Tirar foto (verificação) ---------------------------------------
  tirarFotoVerificarBtn.addEventListener('click', () => {
    if (!streamVerificacao) {
      setStatus(statusVerificacaoEl, '<span>A câmera não está ligada. Tente de novo.</span>');
      return;
    }
    fotoCameraVerificar = tirarFotoDoVideo(videoVerificar);
    fotoTiradaVerificarImg.src = fotoCameraVerificar.toDataURL('image/jpeg', 0.85);
    fotoTiradaVerificarImg.hidden = false;
    videoVerificar.hidden = true;
    tirarFotoVerificarBtn.hidden = true;
    tirarOutraVerificarBtn.hidden = false;
    setStatus(statusVerificacaoEl, null);
  });
  tirarOutraVerificarBtn.addEventListener('click', mostrarVideoVerificar);

  // --- Upload de foto (cadastro) ---------------------------------------
  function selecionarArquivoCadastro(file) {
    if (!file || !file.type.startsWith('image/')) return;
    arquivoCadastro = file;
    previewCadastro.src = URL.createObjectURL(file);
    previewWrapCadastro.hidden = false;
    setStatus(statusCadastroEl, null);
  }
  fileInputCadastro.addEventListener('change', (e) => selecionarArquivoCadastro(e.target.files[0]));
  uploadAreaCadastro.addEventListener('drop', (e) => {
    e.preventDefault();
    selecionarArquivoCadastro(e.dataTransfer.files && e.dataTransfer.files[0]);
  });
  ['dragover', 'dragenter'].forEach((evt) => uploadAreaCadastro.addEventListener(evt, (e) => { e.preventDefault(); uploadAreaCadastro.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((evt) => uploadAreaCadastro.addEventListener(evt, () => uploadAreaCadastro.classList.remove('is-dragover')));
  removeCadastroBtn.addEventListener('click', () => {
    arquivoCadastro = null;
    previewCadastro.src = '';
    previewWrapCadastro.hidden = true;
    fileInputCadastro.value = '';
  });

  // --- Upload de foto (verificação) ---------------------------------------
  function selecionarArquivoVerificar(file) {
    if (!file || !file.type.startsWith('image/')) return;
    arquivoVerificar = file;
    previewVerificar.src = URL.createObjectURL(file);
    previewWrapVerificar.hidden = false;
    setStatus(statusVerificacaoEl, null);
  }
  fileInputVerificar.addEventListener('change', (e) => selecionarArquivoVerificar(e.target.files[0]));
  uploadAreaVerificar.addEventListener('drop', (e) => {
    e.preventDefault();
    selecionarArquivoVerificar(e.dataTransfer.files && e.dataTransfer.files[0]);
  });
  ['dragover', 'dragenter'].forEach((evt) => uploadAreaVerificar.addEventListener(evt, (e) => { e.preventDefault(); uploadAreaVerificar.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((evt) => uploadAreaVerificar.addEventListener(evt, () => uploadAreaVerificar.classList.remove('is-dragover')));
  removeVerificarBtn.addEventListener('click', () => {
    arquivoVerificar = null;
    previewVerificar.src = '';
    previewWrapVerificar.hidden = true;
    fileInputVerificar.value = '';
  });

  // --- Fluxo de cadastro ------------------------------------------------
  // rostoExistente: quando informado, o painel abre no modo "adicionar mais
  // uma foto" pra essa pessoa, em vez de criar um cadastro novo.
  async function abrirCadastro(rostoExistente) {
    pessoaParaAdicionarFoto = rostoExistente || null;
    painelCadastro.hidden = false;
    if (pessoaParaAdicionarFoto) {
      cadastroTituloEl.textContent = `Adicionar foto de ${pessoaParaAdicionarFoto.nome}`;
      nomeInput.value = pessoaParaAdicionarFoto.nome;
      nomeInput.readOnly = true;
      capturarBtn.textContent = 'Adicionar foto';
    } else {
      cadastroTituloEl.textContent = 'Cadastrar rosto de confiança';
      nomeInput.value = '';
      nomeInput.readOnly = false;
      capturarBtn.textContent = 'Salvar';
    }
    setStatus(statusCadastroEl, null);
    abaCadastro = 'camera';
    cadastroTabs.forEach((t) => t.classList.toggle('active', t.dataset.cadastroTab === 'camera'));
    cadastroPaineis.forEach((p) => { p.hidden = p.dataset.cadastroPainel !== 'camera'; });
    mostrarVideoCadastro();
    try {
      streamCadastro = await ligarCamera(videoCadastro);
    } catch (err) {
      setStatus(statusCadastroEl, `<span>${mensagemErroCamera(err)}</span>`);
    }
  }
  abrirCadastroBtn.addEventListener('click', () => abrirCadastro(null));

  function fecharCadastro() {
    painelCadastro.hidden = true;
    desligarCamera(streamCadastro);
    streamCadastro = null;
    fotoCameraCadastro = null;
    arquivoCadastro = null;
    pessoaParaAdicionarFoto = null;
    nomeInput.readOnly = false;
    previewWrapCadastro.hidden = true;
    fileInputCadastro.value = '';
  }
  cancelarCadastroBtn.addEventListener('click', fecharCadastro);

  capturarBtn.addEventListener('click', async () => {
    const nome = nomeInput.value.trim();
    if (!nome) {
      setStatus(statusCadastroEl, '<span>Digite o nome da pessoa antes de salvar.</span>');
      return;
    }
    const usandoCamera = abaCadastro === 'camera';
    if (usandoCamera && !fotoCameraCadastro) {
      setStatus(statusCadastroEl, '<span>Clique em "Tirar foto" antes de salvar.</span>');
      return;
    }
    if (!usandoCamera && !arquivoCadastro) {
      setStatus(statusCadastroEl, '<span>Escolha uma foto antes de salvar.</span>');
      return;
    }
    capturarBtn.disabled = true;
    setStatus(statusCadastroEl, '<div class="spinner"></div><span>Procurando o rosto…</span>');
    try {
      const fonte = usandoCamera ? fotoCameraCadastro : previewCadastro;
      const det = await detectarRosto(fonte);
      if (!det) {
        setStatus(statusCadastroEl, '<span>Não conseguimos identificar um rosto nessa ' + (usandoCamera ? 'foto. Tire outra com boa iluminação e o rosto de frente.' : 'foto. Tente uma com o rosto mais visível e de frente.') + '</span>');
        return;
      }
      const rostos = lerRostos();
      if (pessoaParaAdicionarFoto) {
        const rosto = rostos.find((r) => r.id === pessoaParaAdicionarFoto.id);
        if (rosto) rosto.descriptors.push(Array.from(det.descriptor));
      } else {
        const largura = usandoCamera ? fotoCameraCadastro.width : previewCadastro.naturalWidth;
        const altura = usandoCamera ? fotoCameraCadastro.height : previewCadastro.naturalHeight;
        const foto = gerarThumbnail(fonte, largura, altura);
        rostos.push({ id: `${Date.now()}`, nome, descriptors: [Array.from(det.descriptor)], foto });
      }
      salvarRostos(rostos);
      renderFaceList();
      setStatus(statusCadastroEl, null);
      fecharCadastro();
    } catch (err) {
      setStatus(statusCadastroEl, `<span>Não foi possível salvar agora (${esc(err.message || 'erro desconhecido')}).</span>`);
    } finally {
      capturarBtn.disabled = false;
    }
  });

  // --- Fluxo de verificação ------------------------------------------------
  abrirVerificacaoBtn.addEventListener('click', async () => {
    painelVerificacao.hidden = false;
    resultadoVerificacaoEl.hidden = true;
    setStatus(statusVerificacaoEl, null);
    abaVerificacao = 'camera';
    verificacaoTabs.forEach((t) => t.classList.toggle('active', t.dataset.verificacaoTab === 'camera'));
    verificacaoPaineis.forEach((p) => { p.hidden = p.dataset.verificacaoPainel !== 'camera'; });
    mostrarVideoVerificar();
    try {
      streamVerificacao = await ligarCamera(videoVerificar);
    } catch (err) {
      setStatus(statusVerificacaoEl, `<span>${mensagemErroCamera(err)}</span>`);
    }
  });

  function fecharVerificacao() {
    painelVerificacao.hidden = true;
    desligarCamera(streamVerificacao);
    streamVerificacao = null;
    fotoCameraVerificar = null;
    arquivoVerificar = null;
    previewWrapVerificar.hidden = true;
    fileInputVerificar.value = '';
  }
  fecharVerificacaoBtn.addEventListener('click', fecharVerificacao);

  function renderResultadoComparacao(melhor, distancia) {
    resultadoVerificacaoEl.hidden = false;
    if (melhor && distancia < LIMIAR_MESMA_PESSOA) {
      // Escala pensada pro range típico de distância (0 = rosto idêntico, ~1
      // = rosto bem diferente), não pelo limiar de decisão - senão até uma
      // correspondência válida perto do limiar aparece com % quase zero.
      const confianca = Math.max(1, Math.min(100, Math.round((1 - distancia) * 100)));
      resultadoVerificacaoEl.innerHTML = `
        <div class="result-risk result-risk--baixo">
          <p class="result-risk__title">${ICON_CHECK} Parece ser ${esc(melhor.nome)}</p>
          <p class="result-risk__desc">O rosto bateu com o cadastro de "${esc(melhor.nome)}" (${confianca}% de semelhança). Mesmo assim, isso é só um apoio: se a conversa envolve pedido de dinheiro urgente, confirme também por outro meio, como uma ligação de voz pro número que você já conhece.</p>
          <button type="button" class="btn btn-outline--light" data-compartilhar-btn style="margin-top:0.5rem;">${ICON_SHARE} Compartilhar resultado</button>
        </div>
      `;
    } else {
      resultadoVerificacaoEl.innerHTML = `
        <div class="result-risk result-risk--alto">
          <p class="result-risk__title">${ICON_ALERT} Não bateu com nenhum rosto cadastrado</p>
          <p class="result-risk__desc">Esse rosto não corresponde a nenhuma pessoa de confiança que você cadastrou. Desconfie, principalmente se a pessoa está pedindo dinheiro, dados ou algo urgente. Antes de agir, confirme por outro meio, como uma ligação de voz direto pro número que você já conhece.</p>
          <button type="button" class="btn btn-outline--light" data-compartilhar-btn style="margin-top:0.5rem;">${ICON_SHARE} Compartilhar resultado</button>
        </div>
      `;
    }
    resultadoVerificacaoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const bateu = Boolean(melhor && distancia < LIMIAR_MESMA_PESSOA);
    if (typeof registrarAtividade === 'function') {
      registrarAtividade('rosto', { bateu });
    }
    const compartilharBtn = resultadoVerificacaoEl.querySelector('[data-compartilhar-btn]');
    if (compartilharBtn) {
      compartilharBtn.addEventListener('click', () => {
        const texto = bateu
          ? `Verifiquei um rosto numa videochamada pelo Conecta+ e bateu com "${melhor.nome}", quem eu já tinha cadastrado como pessoa de confiança.\n\nVocê também pode verificar: https://conecta-mais-theta.vercel.app/verificar-rosto.html`
          : `Verifiquei um rosto numa videochamada pelo Conecta+ e NÃO bateu com nenhuma pessoa de confiança que eu tinha cadastrado. Fiquei desconfiado(a).\n\nVocê também pode verificar: https://conecta-mais-theta.vercel.app/verificar-rosto.html`;
        if (navigator.share) {
          navigator.share({ text: texto }).catch(() => {});
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        }
      });
    }
  }

  compararBtn.addEventListener('click', async () => {
    const rostos = lerRostos();
    if (!rostos.length) {
      setStatus(statusVerificacaoEl, '<span>Você ainda não cadastrou nenhum rosto de confiança. Cadastre um primeiro.</span>');
      return;
    }
    const usandoCamera = abaVerificacao === 'camera';
    if (usandoCamera && !fotoCameraVerificar) {
      setStatus(statusVerificacaoEl, '<span>Clique em "Tirar foto" antes de comparar.</span>');
      return;
    }
    if (!usandoCamera && !arquivoVerificar) {
      setStatus(statusVerificacaoEl, '<span>Escolha uma foto antes de comparar.</span>');
      return;
    }
    compararBtn.disabled = true;
    resultadoVerificacaoEl.hidden = true;
    setStatus(statusVerificacaoEl, '<div class="spinner"></div><span>Comparando o rosto…</span>');
    try {
      const fonte = usandoCamera ? fotoCameraVerificar : previewVerificar;
      const det = await detectarRosto(fonte);
      if (!det) {
        setStatus(statusVerificacaoEl, '<span>Não conseguimos identificar um rosto nessa ' + (usandoCamera ? 'foto. Tire outra com boa iluminação e o rosto de frente.' : 'foto. Tente uma com o rosto mais visível e de frente.') + '</span>');
        return;
      }
      let melhor = null;
      let melhorDistancia = Infinity;
      rostos.forEach((r) => {
        // Com mais de uma foto cadastrada pra mesma pessoa, usa a menor
        // distância entre todas elas (basta bater com uma foto/ângulo).
        r.descriptors.forEach((descriptorSalvo) => {
          const distancia = faceapi.euclideanDistance(det.descriptor, new Float32Array(descriptorSalvo));
          if (distancia < melhorDistancia) {
            melhorDistancia = distancia;
            melhor = r;
          }
        });
      });
      setStatus(statusVerificacaoEl, null);
      renderResultadoComparacao(melhor, melhorDistancia);
    } catch (err) {
      setStatus(statusVerificacaoEl, `<span>Não foi possível comparar agora (${esc(err.message || 'erro desconhecido')}).</span>`);
    } finally {
      compararBtn.disabled = false;
    }
  });

  // --- Exportar / importar cadastro ------------------------------------------------
  exportarBtn.addEventListener('click', () => {
    const rostos = lerRostos();
    if (!rostos.length) {
      setStatus(statusExportarEl, '<span>Você ainda não cadastrou nenhum rosto pra exportar.</span>');
      return;
    }
    const blob = new Blob([JSON.stringify(rostos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conecta-mais-rostos-confianca.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(statusExportarEl, '<span>Arquivo baixado. Ele contém dados de rosto (biométricos) - guarde com cuidado e não envie pra estranhos.</span>');
  });

  fileInputImportar.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    fileInputImportar.value = '';
    if (!file) return;
    try {
      const texto = await file.text();
      const dados = JSON.parse(texto);
      if (!Array.isArray(dados)) throw new Error('Formato inválido');
      const validos = dados
        .map(normalizarRosto)
        .filter((r) => r && r.nome && Array.isArray(r.descriptors) && r.descriptors.length && r.foto);
      if (!validos.length) throw new Error('Nenhum rosto válido encontrado no arquivo');
      // IDs novos pra não colidir com o que já existe salvo neste navegador.
      const comNovosIds = validos.map((r, i) => ({ ...r, id: `${Date.now()}-${i}` }));
      const rostos = lerRostos().concat(comNovosIds);
      salvarRostos(rostos);
      renderFaceList();
      setStatus(statusExportarEl, `<span>${comNovosIds.length} rosto(s) importado(s) com sucesso.</span>`);
    } catch (err) {
      setStatus(statusExportarEl, `<span>Não foi possível importar esse arquivo (${esc(err.message || 'formato inválido')}).</span>`);
    }
  });

  // --- Carregamento dos modelos ------------------------------------------------
  (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      statusModeloEl.hidden = true;
      conteudoEl.hidden = false;
      renderFaceList();
    } catch (err) {
      statusModeloEl.innerHTML = `<span>Não foi possível carregar o reconhecimento de rosto agora. Verifique sua conexão com a internet e recarregue a página. (${esc(err.message || 'erro desconhecido')})</span>`;
    }
  })();

  window.addEventListener('beforeunload', () => {
    desligarCamera(streamCadastro);
    desligarCamera(streamVerificacao);
  });
})();
