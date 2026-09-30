/**
 * Novidades do Conecta+, escritas pra quem usa o site (não é um log
 * técnico) - aparecem no painel "Novidades" e no aviso de atualização.
 * Atualizado manualmente a cada mudança real publicada. A entrada mais
 * nova fica no topo.
 */
const CHANGELOG = [
  {
    version: 'v12',
    date: '2026-09-30',
    title: '5 melhorias: texto maior, múltiplas fotos, editar nome, exportar e tour',
    description: 'Botão "A+" (canto inferior direito, em todas as páginas) aumenta o texto e o contraste. No Verificar rosto: dá pra cadastrar mais de uma foto da mesma pessoa (melhora a precisão), editar o nome de quem já foi cadastrado, exportar/importar o cadastro de rostos (arquivo fica só com você, contém dados biométricos), e agora também tem tour guiado nessa página.',
  },
  {
    version: 'v11',
    date: '2026-09-30',
    title: 'Botão "Tirar foto" no Verificar rosto',
    description: 'No modo câmera, agora aparece um botão "Tirar foto" pra congelar a imagem antes de salvar ou comparar, em vez de processar direto o que a câmera está vendo ao vivo. Dá pra ver a foto capturada e clicar em "Tirar outra foto" se não ficou boa, antes de confirmar.',
  },
  {
    version: 'v10',
    date: '2026-09-30',
    title: 'Nova ferramenta: Verificar rosto por webcam ou foto',
    description: 'Agora dá pra cadastrar o rosto de uma pessoa de confiança (parente, amigo) e, numa videochamada estranha, comparar se é realmente ela - pela webcam ao vivo ou enviando uma foto (print da chamada, foto de perfil). Tudo roda no navegador - nenhuma foto ou rosto cadastrado é enviado para servidor nenhum. É um apoio a mais, não substitui confirmar por telefone.',
  },
  {
    version: 'v9',
    date: '2026-09-30',
    title: 'Nova seção "5 coisas que você nunca deve fazer" e alerta de pedido de selfie',
    description: 'A página inicial agora tem um resumo direto das regras mais importantes: nunca clicar em link desconhecido, nunca passar código de SMS, nunca informar dados pessoais, nunca enviar foto do rosto e nunca pagar por pressa. O verificador também passou a reconhecer pedidos de selfie ou foto de documento, usados por golpistas para roubar identidade, com uma nova situação de prática sobre isso.',
  },
  {
    version: 'v8',
    date: '2026-09-30',
    title: 'Mais tipos de golpe reconhecidos, incluindo boleto clonado',
    description: 'O verificador agora também reconhece PIX "enviado por engano" pedindo devolução, investimento com lucro garantido, falsas vagas de emprego, falso sequestro de familiar, falsa central de cartão por telefone e o golpe do boleto clonado (conta de luz/água falsa enviada por WhatsApp ou e-mail). Também foi adicionada uma nova situação de prática sobre boleto clonado, e o aviso de "parece documento oficial" agora explica que é preciso conferir o nome da empresa no código de barras antes de pagar.',
  },
  {
    version: 'v7',
    date: '2026-09-30',
    title: 'Detector reconhece mais um tipo de golpe comum',
    description: 'Adicionado reconhecimento do golpe "meu banco não está funcionando, paga por mim que eu devolvo depois" (muito comum em conversas de WhatsApp). O verificador agora também diferencia sinais fortes (que sozinhos já geram alerta) de sinais fracos (que só contam combinados), deixando as respostas mais precisas.',
  },
  {
    version: 'v6',
    date: '2026-09-30',
    title: 'Verificador não confunde mais contas reais com golpe',
    description: 'Corrigido: uma conta de água, luz ou qualquer boleto de verdade não é mais marcado como suspeito só por mencionar "pagamento". Agora o Conecta+ reconhece campos de conta oficial (código de barras, linha digitável, CNPJ, vencimento) e avisa quando parece um documento legítimo.',
  },
  {
    version: 'v5',
    date: '2026-09-30',
    title: 'Leitura em voz alta e gráfico de progresso',
    description: 'Agora tem um botão pra ouvir cada mensagem de prática em voz alta, e uma página nova "Meu progresso" mostrando um gráfico de como sua pontuação evoluiu ao longo das tentativas.',
  },
  {
    version: 'v4',
    date: '2026-09-30',
    title: 'Tour guiado em todas as páginas',
    description: 'Agora tem um botão de tour (ícone de bússola, canto inferior esquerdo) que explica cada parte da página, passo a passo - na página inicial, na prática e na verificação de mensagem.',
  },
  {
    version: 'v3',
    date: '2026-09-30',
    title: 'Verificar mensagem com leitura automática de print',
    description: 'Agora dá pra enviar um print (foto de tela) do WhatsApp, e-mail ou SMS, ou colar o texto direto, e o Conecta+ lê e aponta os sinais de golpe na hora - inclusive se a mensagem parece spam.',
  },
  {
    version: 'v2',
    date: '2026-09-30',
    title: 'Conecta+ pode ser instalado como aplicativo',
    description: 'Em navegadores compatíveis, aparece um botão "Instalar app" que coloca o Conecta+ na tela inicial do celular ou computador, como um aplicativo de verdade.',
  },
  {
    version: 'v1',
    date: '2026-09-30',
    title: 'Lançamento do Conecta+',
    description: 'Primeira versão: 12 situações de prática pra aprender a reconhecer golpes digitais comuns, com explicação de cada uma e acompanhamento do seu progresso.',
  },
];
