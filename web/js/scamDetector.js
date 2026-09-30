/**
 * Analisador de texto pra apontar sinais de golpe e de spam. Baseado nas
 * mesmas categorias usadas nos cenários de prática (scenarios.js), só que
 * generalizadas em padrões de texto (regex), pra funcionar com qualquer
 * mensagem real que a pessoa cole ou tire por OCR de um print.
 *
 * NÃO é um veredito definitivo - é um apoio. Isso fica bem claro também na
 * tela de resultado (verificar.html/js), pra não passar falsa segurança.
 *
 * Os sinais têm peso "forte" ou "fraco". "Pedido de dinheiro" sozinho é
 * fraco de propósito - toda conta legítima (água, luz, cartão) também
 * pede pagamento, então um único sinal desse tipo não pode virar aviso
 * (achado real: uma conta de água de verdade estava sendo marcada como
 * suspeita). Já coisas como pedido de senha, link estranho ou a
 * combinação "app do banco não funciona, paga por mim que eu devolvo"
 * são específicas de golpe e bastam sozinhas pra gerar um aviso (achado
 * real: uma conversa assim só batia o sinal fraco de pagamento e saía
 * como "sem sinais de golpe", quando claramente era um golpe).
 */
const SCAM_RULES = [
  {
    categoria: 'Pedido de dinheiro ou pagamento',
    peso: 'fraco',
    padrao: /\b(pix|dep[oó]sito|deposite|transfer[eê]ncia|transferir|pagamento|pague|paga(r)?|boleto|taxa (de|para))\b/i,
  },
  {
    categoria: 'Urgência ou ameaça de bloqueio',
    peso: 'forte',
    padrao: /\b(urgente|urgência|imediat\w*|agora mesmo|hoje mesmo|24\s?h(oras)?|bloquead\w*|suspens\w*|cancelad\w*|encerrad\w*)\b/i,
  },
  {
    categoria: 'Prêmio ou dinheiro fácil',
    peso: 'forte',
    padrao: /\b(pr[eê]mio|voc[eê] ganhou|parab[eé]ns.{0,20}ganhou|sorteio|dinheiro f[aá]cil|aux[ií]lio|benef[ií]cio.{0,15}(liberado|dispon[ií]vel))\b/i,
  },
  {
    categoria: 'Pedido de senha, código ou dados sensíveis',
    peso: 'forte',
    padrao: /\b(senha|c[oó]digo de verifica[cç][aã]o|cvv|n[uú]mero do cart[aã]o|dados banc[aá]rios|confirme seus dados)\b/i,
  },
  {
    categoria: 'Link ou site suspeito',
    peso: 'forte',
    padrao: /(bit\.ly|tinyurl|\.tk\b|\.xyz\b|clique (aqui|no link)|acesse (o link|agora)|link de pagamento)/i,
  },
  {
    categoria: 'Falso suporte técnico ou acesso remoto',
    peso: 'forte',
    padrao: /\b(acesso remoto|suporte t[eé]cnico|v[ií]rus detectado|computador infectado|anydesk|teamviewer)\b/i,
  },
  {
    categoria: 'Contato pedindo dinheiro (familiar/paquera pela internet)',
    peso: 'forte',
    padrao: /\b(troquei de n[uú]mero|meu novo (n[uú]mero|contato)|me ajuda(r)? com (a passagem|uma grana|um dinheiro))\b/i,
  },
  {
    // Padrão clássico: a pessoa diz que o banco/app dela não está
    // funcionando e pede pra você pagar por ela, prometendo devolver
    // depois. Muito comum em golpes de WhatsApp com perfil clonado.
    categoria: 'Pedido de pagamento porque "o banco não está funcionando"',
    peso: 'forte',
    padrao: /\b(aplicativo|app|banco|internet banking).{0,25}(n[aã]o est[aá] (funcionando|conectando)|fora do ar|com problema|travad[oa])\b|\b(te|lhe)?\s*reembolso\s*(depois|mais tarde|assim que)/i,
  },
];

// Sinais de que é um documento oficial de verdade (conta de água, luz,
// cartão etc.) - esses campos só existem em boletos/faturas reais, golpe
// nenhum se dá ao trabalho de forjar um código de barras ou linha
// digitável de verdade. Usado pra dar uma confirmação positiva, e também
// pra não confundir "menciona pagamento" (todo boleto real menciona) com
// "é golpe".
const OFFICIAL_DOC_RULES = [
  /linha digit[aá]vel/i,
  /c[oó]digo de barras/i,
  /boleto banc[aá]rio/i,
  /\bcnpj\b/i,
  /\bvencimento\b/i,
  /\bfatura\b/i,
  /nosso n[uú]mero/i,
  /ag[eê]ncia\s*\/?\s*c[oó]digo/i,
];

const SPAM_RULES = [
  { motivo: 'Muitas letras maiúsculas seguidas', teste: (t) => (t.match(/[A-ZÀ-Ú]{6,}/g) || []).length >= 2 },
  { motivo: 'Excesso de pontos de exclamação', teste: (t) => (t.match(/!/g) || []).length >= 4 },
  { motivo: 'Palavras típicas de propaganda agressiva', teste: (t) => /\b(gr[aá]tis|imperd[ií]vel|compre agora|[uú]ltimas (unidades|vagas)|s[oó] hoje)\b/i.test(t) },
];

function normalizar(texto) {
  return String(texto || '').trim();
}

function analisarTexto(textoOriginal) {
  const texto = normalizar(textoOriginal);
  if (!texto) {
    return { vazio: true, sinais: [], riscoGolpe: 'baixo', pareceDocumentoOficial: false, possivelSpam: false, motivosSpam: [] };
  }

  const encontrados = SCAM_RULES.filter((regra) => regra.padrao.test(texto));
  const sinais = encontrados.map((regra) => regra.categoria);
  const fortes = encontrados.filter((regra) => regra.peso === 'forte').length;
  const fracos = encontrados.length - fortes;
  const motivosSpam = SPAM_RULES.filter((regra) => regra.teste(texto)).map((regra) => regra.motivo);
  const sinaisDocumentoOficial = OFFICIAL_DOC_RULES.filter((regra) => regra.test(texto)).length;

  // Um sinal forte sozinho (pedido de senha, link suspeito, "o banco não
  // funciona, paga por mim"...) já é grave o bastante pra avisar. Um
  // sinal fraco sozinho (só "pagamento") não é - precisa de outro sinal
  // junto (forte ou fraco) pra virar aviso.
  let riscoGolpe = 'baixo';
  if (fortes >= 2) riscoGolpe = 'alto';
  else if (fortes >= 1 || fracos >= 2) riscoGolpe = 'atencao';

  // Marca como "documento oficial" quando o risco ainda está em "baixo"
  // (no máximo 1 sinal fraco, tipo "pagar" - normal em qualquer boleto de
  // verdade) e existe pelo menos um campo típico de conta oficial (código
  // de barras, linha digitável, CNPJ, vencimento...).
  const pareceDocumentoOficial = riscoGolpe === 'baixo' && sinaisDocumentoOficial > 0;

  return {
    vazio: false,
    texto,
    sinais,
    riscoGolpe, // 'alto' | 'atencao' | 'baixo'
    pareceDocumentoOficial,
    possivelSpam: motivosSpam.length > 0,
    motivosSpam,
  };
}

// Disponível tanto pra <script> comum (web) quanto pra quem quiser importar
// como módulo no futuro (ex.: testes automatizados em Node).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analisarTexto };
}
