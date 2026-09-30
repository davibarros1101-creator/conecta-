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
  {
    // PIX enviado "errado"/"a mais" e pede devolução. A vítima devolve de
    // verdade, e depois o PIX original é estornado (ou era de uma conta
    // roubada) - ela perde o dinheiro que devolveu.
    categoria: 'PIX enviado "por engano" pedindo devolução',
    peso: 'forte',
    padrao: /\b(pix|dep[oó]sito).{0,25}(por engano|errado|sem querer|a mais)\b|\bdevolv(er|a|e).{0,20}pix\b/i,
  },
  {
    categoria: 'Investimento com lucro garantido',
    peso: 'forte',
    padrao: /\b(lucro garantido|rentabilidade de \d|dobr\w+ (o|seu) dinheiro|investimento sem risco|renda extra garantida|multiplica\w* seu dinheiro)\b/i,
  },
  {
    categoria: 'Falsa vaga de emprego ou tarefa paga',
    peso: 'forte',
    padrao: /\b(vaga dispon[ií]vel|trabalhe de casa|renda extra.{0,15}(whatsapp|celular)|tarefa(s)? (simples|rápidas)|curtir v[ií]deos?|avaliar produtos? e ganhar)\b/i,
  },
  {
    // Golpe do falso sequestro: liga dizendo que um familiar foi
    // sequestrado ou está em apuros (acidente, preso) e pede dinheiro ou
    // pix na hora, sem deixar a pessoa checar.
    categoria: 'Falso sequestro ou familiar em apuros',
    peso: 'forte',
    padrao: /\b(seu (filho|neto|marido|esposa|pai|m[aã]e)|sua (filha|neta|esposa)).{0,30}(sequestr\w*|bateu o carro|sofreu um acidente|foi preso|est[aá] detido)\b|\bn[aã]o (desligue|desliga) o telefone\b/i,
  },
  {
    // Falsa central de cartão: liga se passando pelo banco, avisa de
    // "compra suspeita" e induz a pessoa a passar o cartão pra um
    // motoboy/chip novo ou confirmar dados "pra cancelar".
    categoria: 'Falsa central de cartão ou banco por telefone',
    peso: 'forte',
    padrao: /\b(compra suspeita|tentativa de compra|motoboy (vai )?(passar|buscar)|entregar(emos)? um novo cart[aã]o|chip (de seguran[cç]a|novo)|recolher (o|seu) cart[aã]o)\b/i,
  },
  {
    // Boleto clonado: o golpista copia uma conta de luz, água, telefone
    // etc. de verdade e só troca o código de barras/beneficiário, pra
    // receber o pagamento na conta dele. Achado real: comparação entre
    // conta de luz falsa e original, onde a única diferença visível era a
    // parte de baixo (código de barras) incompleta na falsa.
    categoria: 'Possível boleto clonado (conta com valor ou vencimento trocado)',
    peso: 'fraco',
    padrao: /\b(fatura|boleto|conta)\b.{0,30}\b(atualizad\w*|corrigid\w*|segunda via|nova via)\b|\b(segunda via|nova via)\b.{0,30}\b(fatura|boleto|conta)\b/i,
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
  //
  // IMPORTANTE (achado real, com exemplo de boleto de luz falso de
  // verdade): ter esses campos não prova que o boleto é legítimo - existe
  // o golpe do "boleto clonado", onde o golpista copia a conta de luz/água
  // de verdade e só troca o nome do beneficiário e o código de barras/PIX,
  // pra receber o pagamento na conta dele em vez da concessionária. Texto
  // sozinho (OCR) não consegue confirmar se o beneficiário é mesmo a
  // empresa certa - por isso esse selo nunca deve soar como "100%
  // confirmado", e a tela de resultado sempre orienta a conferir o nome
  // da empresa antes de pagar.
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
