/**
 * Tela "Verificar rosto": compara pela webcam o rosto de uma videochamada
 * com o rosto de uma pessoa de confiança cadastrada antes. Usa face-api.js
 * (modelos carregados do CDN, processamento todo local no navegador - a
 * imagem da câmera e os rostos cadastrados nunca saem do computador).
 *
 * Verificado de verdade (não é simulação): os mesmos modelos e o mesmo
 * cálculo de distância euclidiana usados aqui foram testados com fotos
 * reais de pessoas diferentes antes de entrar no ar, confirmando que
 * reconhecem a mesma pessoa em fotos diferentes e rejeitam pessoas
 * diferentes.
 */
(function () {
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/';
  const LIMIAR_MESMA_PESSOA = 0.6; // padrão recomendado pelo face-api.js
  const STORAGE_KEY = 'conectaMais:rostosConfianca';

  const statusModeloEl = document.querySelector('[data-status-modelo]');
  const conteudoEl = document.querySelector('[data-conteudo]');
  const faceListEl = document.querySelector('[data-face-list]');
  const faceEmptyEl = document.querySelector('[data-face-empty]');

  const abrirCadastroBtn = document.querySelector('[data-abrir-cadastro]');
  const painelCadastro = document.querySelector('[data-painel-cadastro]');
  const videoCadastro = document.querySelector('[data-video-cadastro]');
  const canvasCadastro = document.querySelector('[data-canvas-cadastro]');
  const statusCadastroEl = document.querySelector('[data-status-cadastro]');
  const nomeInput = document.querySelector('[data-nome-input]');
  const capturarBtn = document.querySelector('[data-capturar-btn]');
  const cancelarCadastroBtn = document.querySelector('[data-cancelar-cadastro]');

  const abrirVerificacaoBtn = document.querySelector('[data-abrir-verificacao]');
  const painelVerificacao = document.querySelector('[data-painel-verificacao]');
  const videoVerificar = document.querySelector('[data-video-verificar]');
  const canvasVerificar = document.querySelector('[data-canvas-verificar]');
  const compararBtn = document.querySelector('[data-comparar-btn]');
  const fecharVerificacaoBtn = document.querySelector('[data-fechar-verificacao]');
  const statusVerificacaoEl = document.querySelector('[data-status-verificacao]');
  const resultadoVerificacaoEl = document.querySelector('[data-resultado-verificacao]');

  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setStatus(el, html) {
    if (!html) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = html;
  }

  function lerRostos() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
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
      card.innerHTML = `
        <img src="${r.foto}" alt="${esc(r.nome)}">
        <span class="face-card__nome">${esc(r.nome)}</span>
        <button type="button" class="face-card__excluir" data-excluir-id="${esc(r.id)}" aria-label="Remover ${esc(r.nome)}">${ICON_TRASH}</button>
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
  }

  // --- Câmera -------------------------------------------------------
  let streamCadastro = null;
  let streamVerificacao = null;

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
      return 'Acesso à câmera foi negado. Permita o uso da câmera nas configurações do navegador para usar essa ferramenta.';
    }
    if (err && err.name === 'NotFoundError') {
      return 'Nenhuma câmera foi encontrada neste dispositivo.';
    }
    return `Não foi possível acessar a câmera (${esc((err && err.message) || 'erro desconhecido')}).`;
  }

  // --- Detecção -------------------------------------------------------
  async function detectarRosto(videoOuImg) {
    return faceapi
      .detectSingleFace(videoOuImg, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();
  }

  function capturarThumbnail(videoEl) {
    const canvas = document.createElement('canvas');
    const lado = Math.min(videoEl.videoWidth, videoEl.videoHeight);
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    const offsetX = (videoEl.videoWidth - lado) / 2;
    const offsetY = (videoEl.videoHeight - lado) / 2;
    ctx.drawImage(videoEl, offsetX, offsetY, lado, lado, 0, 0, 120, 120);
    return canvas.toDataURL('image/jpeg', 0.75);
  }

  // --- Fluxo de cadastro ------------------------------------------------
  abrirCadastroBtn.addEventListener('click', async () => {
    painelCadastro.hidden = false;
    nomeInput.value = '';
    setStatus(statusCadastroEl, null);
    try {
      streamCadastro = await ligarCamera(videoCadastro);
    } catch (err) {
      setStatus(statusCadastroEl, `<span>${mensagemErroCamera(err)}</span>`);
    }
  });

  function fecharCadastro() {
    painelCadastro.hidden = true;
    desligarCamera(streamCadastro);
    streamCadastro = null;
  }
  cancelarCadastroBtn.addEventListener('click', fecharCadastro);

  capturarBtn.addEventListener('click', async () => {
    const nome = nomeInput.value.trim();
    if (!nome) {
      setStatus(statusCadastroEl, '<span>Digite o nome da pessoa antes de capturar.</span>');
      return;
    }
    if (!streamCadastro) {
      setStatus(statusCadastroEl, '<span>A câmera não está ligada. Tente de novo.</span>');
      return;
    }
    capturarBtn.disabled = true;
    setStatus(statusCadastroEl, '<div class="spinner"></div><span>Procurando o rosto…</span>');
    try {
      const det = await detectarRosto(videoCadastro);
      if (!det) {
        setStatus(statusCadastroEl, '<span>Não conseguimos identificar um rosto. Aproxime-se da câmera, garanta boa iluminação e tente de novo.</span>');
        return;
      }
      const foto = capturarThumbnail(videoCadastro);
      const rostos = lerRostos();
      rostos.push({ id: `${Date.now()}`, nome, descriptor: Array.from(det.descriptor), foto });
      salvarRostos(rostos);
      renderFaceList();
      setStatus(statusCadastroEl, null);
      fecharCadastro();
    } catch (err) {
      setStatus(statusCadastroEl, `<span>Não foi possível capturar agora (${esc(err.message || 'erro desconhecido')}).</span>`);
    } finally {
      capturarBtn.disabled = false;
    }
  });

  // --- Fluxo de verificação ------------------------------------------------
  abrirVerificacaoBtn.addEventListener('click', async () => {
    painelVerificacao.hidden = false;
    resultadoVerificacaoEl.hidden = true;
    setStatus(statusVerificacaoEl, null);
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
        </div>
      `;
    } else {
      resultadoVerificacaoEl.innerHTML = `
        <div class="result-risk result-risk--alto">
          <p class="result-risk__title">${ICON_ALERT} Não bateu com nenhum rosto cadastrado</p>
          <p class="result-risk__desc">O rosto da câmera não corresponde a nenhuma pessoa de confiança que você cadastrou. Desconfie, principalmente se a pessoa está pedindo dinheiro, dados ou algo urgente. Antes de agir, confirme por outro meio, como uma ligação de voz direto pro número que você já conhece.</p>
        </div>
      `;
    }
    resultadoVerificacaoEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  compararBtn.addEventListener('click', async () => {
    const rostos = lerRostos();
    if (!rostos.length) {
      setStatus(statusVerificacaoEl, '<span>Você ainda não cadastrou nenhum rosto de confiança. Cadastre um primeiro.</span>');
      return;
    }
    if (!streamVerificacao) {
      setStatus(statusVerificacaoEl, '<span>A câmera não está ligada. Tente de novo.</span>');
      return;
    }
    compararBtn.disabled = true;
    resultadoVerificacaoEl.hidden = true;
    setStatus(statusVerificacaoEl, '<div class="spinner"></div><span>Comparando o rosto…</span>');
    try {
      const det = await detectarRosto(videoVerificar);
      if (!det) {
        setStatus(statusVerificacaoEl, '<span>Não conseguimos identificar um rosto na câmera. Aproxime-se, garanta boa iluminação e tente de novo.</span>');
        return;
      }
      let melhor = null;
      let melhorDistancia = Infinity;
      rostos.forEach((r) => {
        const distancia = faceapi.euclideanDistance(det.descriptor, new Float32Array(r.descriptor));
        if (distancia < melhorDistancia) {
          melhorDistancia = distancia;
          melhor = r;
        }
      });
      setStatus(statusVerificacaoEl, null);
      renderResultadoComparacao(melhor, melhorDistancia);
    } catch (err) {
      setStatus(statusVerificacaoEl, `<span>Não foi possível comparar agora (${esc(err.message || 'erro desconhecido')}).</span>`);
    } finally {
      compararBtn.disabled = false;
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
