/**
 * Gráfico de progresso: lê o histórico de tentativas de prática guardado
 * em localStorage (conectaMais:historico, o mesmo que praticar.js grava)
 * e desenha um gráfico de barras simples mostrando a evolução da
 * pontuação, com tabela acessível equivalente logo abaixo.
 */
(function () {
  const HISTORICO_KEY = 'conectaMais:historico';
  const container = document.querySelector('[data-conteudo]');
  if (!container) return;

  function lerHistorico() {
    try { return JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]'); } catch { return []; }
  }

  function fmtData(iso) {
    try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return ''; }
  }

  const historico = lerHistorico();

  if (!historico.length) {
    container.innerHTML = `
      <div class="scenario-card" style="text-align:center;">
        <p>Você ainda não praticou nenhuma vez.</p>
        <a class="btn btn-primary" href="praticar.html">Começar a praticar</a>
      </div>
    `;
    return;
  }

  const primeira = historico[0];
  const ultima = historico[historico.length - 1];
  const melhor = historico.reduce((m, h) => (h.acertos > m.acertos ? h : m), historico[0]);

  let resumoHtml = `<p>Você já praticou <strong>${historico.length}</strong> ${historico.length === 1 ? 'vez' : 'vezes'}. Sua melhor pontuação foi <strong>${melhor.acertos} de ${melhor.total}</strong>.</p>`;
  if (historico.length > 1) {
    const diff = ultima.acertos - primeira.acertos;
    const msg = diff > 0
      ? `Você melhorou ${diff} ${diff === 1 ? 'ponto' : 'pontos'} desde a primeira tentativa.`
      : diff < 0
        ? 'Sua pontuação mais recente ficou um pouco abaixo da primeira tentativa, mas continue praticando.'
        : 'Sua pontuação mais recente repetiu a da primeira tentativa.';
    resumoHtml += `<p>${msg}</p>`;
  }

  container.innerHTML = `
    <div class="scenario-card">
      ${resumoHtml}
      <div data-chart-wrap style="margin-top:1.5rem;"></div>
    </div>
  `;

  renderChart(document.querySelector('[data-chart-wrap]'), historico);

  function renderChart(wrap, dados) {
    const MAX = 12;
    const W = 640;
    const H = 260;
    const marginLeft = 32;
    const marginBottom = 34;
    const marginTop = 28;
    const marginRight = 12;
    const plotW = W - marginLeft - marginRight;
    const plotH = H - marginTop - marginBottom;
    const n = dados.length;
    const bandW = plotW / n;
    const barW = Math.min(24, bandW * 0.55);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Gráfico de barras mostrando sua pontuação em cada tentativa de prática');
    svg.classList.add('historico-chart');

    // Gridlines + rótulos do eixo Y (0, 3, 6, 9, 12)
    [0, 3, 6, 9, 12].forEach((val) => {
      const y = marginTop + plotH - (val / MAX) * plotH;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', marginLeft);
      line.setAttribute('x2', W - marginRight);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'historico-chart__grid');
      svg.appendChild(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', marginLeft - 8);
      label.setAttribute('y', y + 3);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('class', 'historico-chart__axis-label');
      label.textContent = String(val);
      svg.appendChild(label);
    });

    dados.forEach((item, i) => {
      const cx = marginLeft + bandW * i + bandW / 2;
      const barH = (item.acertos / MAX) * plotH;
      const y = marginTop + plotH - barH;

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', cx - barW / 2);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barW);
      rect.setAttribute('height', Math.max(barH, 2));
      rect.setAttribute('rx', 4);
      rect.setAttribute('class', 'historico-chart__bar');
      rect.setAttribute('tabindex', '0');
      rect.setAttribute('role', 'img');
      rect.setAttribute('aria-label', `Tentativa ${i + 1}, ${fmtData(item.data)}: ${item.acertos} de ${item.total} acertos`);
      svg.appendChild(rect);

      // Rótulo direto só na primeira e na última barra (a história de
      // "antes e depois"), as demais ficam disponíveis no hover/foco e na
      // tabela, pra não poluir o gráfico com um número em cada barra.
      if (i === 0 || i === dados.length - 1) {
        const val = document.createElementNS(svgNS, 'text');
        val.setAttribute('x', cx);
        val.setAttribute('y', y - 8);
        val.setAttribute('text-anchor', 'middle');
        val.setAttribute('class', 'historico-chart__value-label');
        val.textContent = String(item.acertos);
        svg.appendChild(val);
      }

      const xLabel = document.createElementNS(svgNS, 'text');
      xLabel.setAttribute('x', cx);
      xLabel.setAttribute('y', H - marginBottom + 18);
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.setAttribute('class', 'historico-chart__axis-label');
      xLabel.textContent = String(i + 1);
      svg.appendChild(xLabel);

      const onEnter = () => mostrarTooltip(rect, item, i);
      const onLeave = () => esconderTooltip();
      rect.addEventListener('pointerenter', onEnter);
      rect.addEventListener('focus', onEnter);
      rect.addEventListener('pointerleave', onLeave);
      rect.addEventListener('blur', onLeave);
    });

    wrap.innerHTML = '';
    wrap.appendChild(svg);

    const tooltip = document.createElement('div');
    tooltip.className = 'historico-chart__tooltip';
    tooltip.hidden = true;
    wrap.style.position = 'relative';
    wrap.appendChild(tooltip);

    function mostrarTooltip(rect, item, i) {
      const rectBox = rect.getBoundingClientRect();
      const wrapBox = wrap.getBoundingClientRect();
      tooltip.innerHTML = `<strong>${item.acertos} de ${item.total}</strong><span>Tentativa ${i + 1} · ${fmtData(item.data)}</span>`;
      tooltip.style.left = `${rectBox.left - wrapBox.left + rectBox.width / 2}px`;
      tooltip.style.top = `${rectBox.top - wrapBox.top}px`;
      tooltip.hidden = false;
    }
    function esconderTooltip() { tooltip.hidden = true; }

    // Tabela acessível equivalente, pra quem usa leitor de tela ou
    // simplesmente prefere ver os números direto (o gráfico por si só
    // nunca é a única forma de acessar um valor).
    const tabelaWrap = document.createElement('div');
    tabelaWrap.style.overflowX = 'auto';
    tabelaWrap.style.marginTop = '1.2rem';
    tabelaWrap.innerHTML = `
      <table class="historico-table">
        <thead><tr><th>Tentativa</th><th>Data</th><th>Pontuação</th></tr></thead>
        <tbody>
          ${dados.map((item, i) => `<tr><td>${i + 1}</td><td>${esc(fmtData(item.data))}</td><td>${item.acertos} de ${item.total}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    wrap.appendChild(tabelaWrap);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
