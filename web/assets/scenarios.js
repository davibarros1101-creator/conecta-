const SCENARIOS = [
  {
    "id": "premio-taxa",
    "categoria": "Prêmio ou dinheiro inesperado",
    "canal": "SMS",
    "remetente": "PROMOÇÃO",
    "mensagem": "Parabéns! Você ganhou R$ 5.000,00 em nossa promoção. Para receber o prêmio, faça um depósito de R$ 250,00 para liberar o pagamento.",
    "isGolpe": true,
    "sinais": [
      "Pedido de dinheiro adiantado",
      "Promessa de dinheiro fácil",
      "Urgência"
    ],
    "explicacao": "É um golpe. Nenhuma promoção séria pede pagamento para você receber um prêmio. Esse pedido de \"taxa de liberação\" é o principal sinal de alerta."
  },
  {
    "id": "falso-banco",
    "categoria": "Falso banco",
    "canal": "SMS",
    "remetente": "Banco",
    "mensagem": "Sua conta será bloqueada em 24h por segurança. Clique aqui para atualizar seus dados agora: bit.ly/atualizar-conta",
    "isGolpe": true,
    "sinais": [
      "Link desconhecido",
      "Urgência",
      "Ameaça de bloqueio"
    ],
    "explicacao": "É um golpe. Bancos de verdade não bloqueiam contas por SMS nem pedem para atualizar dados clicando em links curtos e desconhecidos. Nunca clique nesse tipo de link."
  },
  {
    "id": "whatsapp-familiar",
    "categoria": "WhatsApp de familiar",
    "canal": "WhatsApp",
    "remetente": "Contato novo",
    "mensagem": "Oi mãe, troquei de número, esse é meu novo contato. Estou com um problema e preciso que você faça um Pix de R$ 300 urgente, depois te explico.",
    "isGolpe": true,
    "sinais": [
      "Pedido de dinheiro",
      "Urgência",
      "Número novo, não confirmado por ligação"
    ],
    "explicacao": "É um golpe muito comum. Antes de fazer qualquer Pix, ligue para o número antigo do seu familiar ou fale por vídeo para confirmar que é realmente ele."
  },
  {
    "id": "falso-funcionario-banco",
    "categoria": "Falso funcionário do banco",
    "canal": "Ligação",
    "remetente": "\"Central de segurança\"",
    "mensagem": "Aqui é do seu banco. Identificamos uma tentativa de fraude na sua conta. Para proteger seu dinheiro, me confirme o código que acabou de chegar por SMS.",
    "isGolpe": true,
    "sinais": [
      "Solicitação de senha ou código",
      "Se passa por autoridade (o banco)",
      "Urgência"
    ],
    "explicacao": "É um golpe. O banco NUNCA liga pedindo para você informar senhas, códigos de SMS ou confirmar transferências por telefone. Desligue e ligue você mesmo para o número oficial do banco."
  },
  {
    "id": "link-encomenda",
    "categoria": "Link falso de encomenda",
    "canal": "SMS",
    "remetente": "Correios",
    "mensagem": "Sua encomenda está retida por falta de pagamento da taxa alfandegária. Pague R$ 12,90 aqui para liberar: correios-pagamento.tk",
    "isGolpe": true,
    "sinais": [
      "Link desconhecido (não é site oficial)",
      "Valor pequeno para parecer real",
      "Urgência"
    ],
    "explicacao": "É um golpe. O valor pequeno é de propósito, para parecer inofensivo. O site \"correios-pagamento.tk\" não é o site oficial dos Correios. Desconfie sempre de links assim."
  },
  {
    "id": "falso-beneficio",
    "categoria": "Falso benefício",
    "canal": "WhatsApp",
    "remetente": "\"Governo Federal\"",
    "mensagem": "Você foi selecionado para receber um auxílio de R$ 600. Cadastre-se agora enviando seus dados bancários e uma taxa de análise de R$ 19,90.",
    "isGolpe": true,
    "sinais": [
      "Promessa de dinheiro fácil",
      "Pedido de dados bancários",
      "Taxa antecipada"
    ],
    "explicacao": "É um golpe. Benefícios do governo nunca são anunciados por WhatsApp e nunca cobram taxa para você receber. Não informe dados bancários nesse tipo de mensagem."
  },
  {
    "id": "falso-suporte",
    "categoria": "Falso suporte técnico",
    "canal": "Pop-up no computador",
    "remetente": "\"Suporte Microsoft\"",
    "mensagem": "ALERTA: seu computador está infectado com 3 vírus perigosos. Ligue agora para o suporte técnico ou instale nosso programa de acesso remoto para resolver.",
    "isGolpe": true,
    "sinais": [
      "Alarme exagerado",
      "Pedido de acesso remoto ao computador",
      "Urgência"
    ],
    "explicacao": "É um golpe. Empresas como Microsoft não mostram esse tipo de aviso na tela nem pedem acesso remoto ao seu computador. Feche a janela e nunca instale programas de acesso remoto por pedido de estranhos."
  },
  {
    "id": "golpe-romantico",
    "categoria": "Golpe do amor",
    "canal": "Rede social",
    "remetente": "Pessoa conhecida pela internet",
    "mensagem": "Amor, finalmente vou poder te visitar! Só preciso que você me ajude com a passagem, umas R$ 800. Prometo que te pago assim que chegar.",
    "isGolpe": true,
    "sinais": [
      "Pedido de dinheiro de alguém que você só conhece pela internet",
      "Promessa vaga de pagar depois",
      "Nunca se encontraram pessoalmente"
    ],
    "explicacao": "É um golpe muito comum, conhecido como \"golpe do amor\". Pedidos de dinheiro de pessoas que você só conhece pela internet, mesmo depois de meses de conversa, quase sempre são golpe."
  },
  {
    "id": "boleto-clonado",
    "categoria": "Boleto clonado (conta de luz/água falsa)",
    "canal": "WhatsApp",
    "remetente": "\"Companhia de energia\"",
    "mensagem": "Prezado cliente, segue sua fatura de energia atualizada em anexo. Caso já tenha pago, desconsidere. Pague em qualquer banco ou use o código de barras da imagem.",
    "isGolpe": true,
    "sinais": [
      "Boleto de empresa enviado fora do canal oficial (WhatsApp)",
      "Pedido para pagar com urgência",
      "Código de barras diferente do usado sempre"
    ],
    "explicacao": "É um golpe conhecido como \"boleto clonado\". O golpista copia uma conta de luz, água ou telefone de verdade e troca só o código de barras, pra receber o pagamento na conta dele em vez da empresa. Nunca pague um boleto recebido por WhatsApp ou e-mail sem antes conferir o valor e o código de barras direto no aplicativo oficial da empresa ou no site dela."
  },
  {
    "id": "extrato-legitimo",
    "categoria": "Comunicação real do banco",
    "canal": "E-mail",
    "remetente": "Banco",
    "mensagem": "Prezado cliente, seu extrato mensal já está disponível no aplicativo do banco. Consulte quando quiser, sem necessidade de nenhuma ação.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. A mensagem não pede dinheiro, não pede senha e não tem link para clicar, só avisa que uma informação está disponível no aplicativo oficial. Mesmo assim, o mais seguro é sempre abrir o app do banco direto, sem clicar em links de mensagens."
  },
  {
    "id": "familiar-legitimo",
    "categoria": "Mensagem real de familiar",
    "canal": "WhatsApp",
    "remetente": "Contato salvo",
    "mensagem": "Oi mãe, cheguei bem em casa! Um beijo, te ligo mais tarde.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É uma mensagem simples, sem pedido de dinheiro, sem urgência e vindo de um contato que já está salvo no seu celular."
  },
  {
    "id": "compra-legitima",
    "categoria": "Aviso real de compra",
    "canal": "SMS",
    "remetente": "Loja",
    "mensagem": "Seu pedido #48213 foi enviado e deve chegar em até 5 dias úteis. Para acompanhar, acesse o site oficial da loja onde você comprou.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. A mensagem não pede pagamento nem clique em link duvidoso, orienta a acompanhar pelo site oficial, que é o jeito mais seguro de confirmar."
  },
  {
    "id": "promocao-legitima",
    "categoria": "Promoção real de loja",
    "canal": "E-mail",
    "remetente": "Loja conhecida",
    "mensagem": "Essa semana é de descontos: 10% em toda a loja! Confira as novidades no nosso site oficial.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É uma promoção comum, sem pedido de pagamento antecipado, taxa ou dado sensível para \"liberar\" alguma coisa."
  }
];
