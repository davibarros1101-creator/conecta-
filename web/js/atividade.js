/**
 * Registro unificado de atividade (prática, verificar mensagem, verificar
 * rosto), usado pra montar a linha do tempo em "Meu progresso". Guarda só
 * o tipo, o resultado (classificação) e a data - nunca o conteúdo
 * analisado (texto da mensagem, imagem, foto do rosto na hora da
 * comparação). Mantém só os últimos 20 registros.
 */
const ATIVIDADE_KEY = 'conectaMais:atividade';
const ATIVIDADE_LIMITE = 20;

function registrarAtividade(tipo, resumo) {
  try {
    const lista = JSON.parse(localStorage.getItem(ATIVIDADE_KEY) || '[]');
    lista.push({ data: new Date().toISOString(), tipo, resumo });
    localStorage.setItem(ATIVIDADE_KEY, JSON.stringify(lista.slice(-ATIVIDADE_LIMITE)));
  } catch { /* localStorage indisponível, segue sem guardar */ }
}

function lerAtividades() {
  try {
    return JSON.parse(localStorage.getItem(ATIVIDADE_KEY) || '[]');
  } catch {
    return [];
  }
}
