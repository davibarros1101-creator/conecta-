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
    "id": "falso-cadastro-selfie",
    "categoria": "Pedido de selfie ou foto de documento",
    "canal": "WhatsApp",
    "remetente": "\"Recadastramento Caixa\"",
    "mensagem": "Para continuar recebendo seu benefício, é necessário concluir o recadastramento. Envie uma selfie segurando seu documento com foto nos próximos 30 minutos.",
    "isGolpe": true,
    "sinais": [
      "Pedido de foto do rosto/selfie",
      "Urgência (prazo curto)",
      "Se passa por órgão oficial"
    ],
    "explicacao": "É um golpe. Pedir selfie segurando documento é uma forma de roubar sua identidade: com essa foto, golpistas conseguem abrir contas, pegar empréstimos ou fazer cartões em seu nome. Órgãos públicos e bancos não pedem esse tipo de foto por WhatsApp."
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
  },
  {
    "id": "pix-devolucao",
    "categoria": "PIX enviado \"por engano\" pedindo devolução",
    "canal": "WhatsApp",
    "remetente": "Número desconhecido",
    "mensagem": "Oi, acho que fiz um Pix errado pra sua conta agora a pouco, umas 350 reais. Pode devolver assim que puder? Preciso desse dinheiro hoje ainda.",
    "isGolpe": true,
    "sinais": [
      "Pedido de devolução de um Pix que você não pediu",
      "Urgência (hoje ainda)",
      "Número desconhecido"
    ],
    "explicacao": "É um golpe conhecido como \"Pix da devolução\". O golpista faz um Pix com dinheiro de uma conta roubada (ou usa um comprovante falso) e pede pra você \"devolver\". Se você devolver de verdade, perde o seu dinheiro quando o Pix original for estornado ou identificado como fraude. Antes de devolver qualquer coisa, confira direto no extrato do seu banco se o valor realmente caiu na sua conta."
  },
  {
    "id": "falso-emprego-taxa",
    "categoria": "Falsa vaga de emprego (taxa de material)",
    "canal": "WhatsApp",
    "remetente": "\"RH - Vagas Home Office\"",
    "mensagem": "Parabéns, você foi pré-aprovado(a) para a vaga de digitação em casa! Para receber seu kit de material e começar amanhã, é só pagar uma taxa única de R$ 89,90.",
    "isGolpe": true,
    "sinais": [
      "Pedido de pagamento para começar a trabalhar",
      "Vaga fácil demais, sem entrevista",
      "Urgência pra pagar"
    ],
    "explicacao": "É um golpe. Emprego de verdade nunca cobra taxa de material, de kit ou de cadastro para você começar a trabalhar. Se alguém pede pagamento antes de te contratar, é golpe, desconfie sempre."
  },
  {
    "id": "codigo-whatsapp",
    "categoria": "Pedido do código de verificação do WhatsApp",
    "canal": "WhatsApp",
    "remetente": "\"Amiga do grupo\"",
    "mensagem": "Oi, foi mal te incomodar, mandei um código de 6 números sem querer pro seu número, pode me passar aqui? Preciso urgente pra entrar numa reunião.",
    "isGolpe": true,
    "sinais": [
      "Pedido do código de verificação",
      "Desculpa de \"mandei sem querer\"",
      "Urgência"
    ],
    "explicacao": "É um golpe. Esse código de 6 números é o código que o WhatsApp manda pra confirmar SEU número, nunca é enviado pra outra pessoa sem querer. Quem pede esse código quer clonar a sua conta do WhatsApp pra depois pedir dinheiro pros seus contatos se passando por você. Nunca compartilhe esse código com ninguém, nem com quem parece conhecido."
  },
  {
    "id": "falsa-multa-transito",
    "categoria": "Falsa multa de trânsito",
    "canal": "SMS",
    "remetente": "DETRAN",
    "mensagem": "DETRAN: consta 1 multa em aberto no seu CPF com desconto de 40% até hoje. Pague agora: detran-multas.info/pagamento",
    "isGolpe": true,
    "sinais": [
      "Link que não é do site oficial do governo (.gov.br)",
      "Urgência (desconto só até hoje)",
      "Desconto exagerado para parecer vantajoso"
    ],
    "explicacao": "É um golpe. Sites oficiais de multas terminam em gov.br, nunca em .info ou outro domínio estranho. O DETRAN não manda SMS com link de pagamento direto e com prazo de poucas horas. Para conferir multas de verdade, acesse o site oficial do DETRAN do seu estado digitando o endereço você mesmo."
  },
  {
    "id": "falsa-restituicao-ir",
    "categoria": "Falsa restituição de Imposto de Renda",
    "canal": "E-mail",
    "remetente": "\"Receita Federal\"",
    "mensagem": "Prezado contribuinte, identificamos uma restituição de R$ 1.847,32 disponível em seu nome. Para receber, confirme seus dados bancários no link a seguir em até 48 horas.",
    "isGolpe": true,
    "sinais": [
      "Pedido de dados bancários por e-mail",
      "Link para \"confirmar dados\"",
      "Prazo curto (48 horas)"
    ],
    "explicacao": "É um golpe. A Receita Federal nunca pede dados bancários por e-mail ou link para liberar restituição, esse valor é depositado automaticamente na conta que você já informou na declaração. Para conferir restituição de verdade, use só o aplicativo oficial \"Meu Imposto de Renda\" ou o site gov.br, nunca um link recebido por e-mail."
  },
  {
    "id": "falso-13-inss",
    "categoria": "Falso 13º / benefício do INSS",
    "canal": "WhatsApp",
    "remetente": "\"INSS Atendimento\"",
    "mensagem": "Seu 13º salário do INSS já está disponível para saque antecipado. Clique aqui e informe seu CPF e senha do Meu INSS para liberar: meuinss-13.com",
    "isGolpe": true,
    "sinais": [
      "Pedido de senha",
      "Link que não é o site oficial (gov.br)",
      "Se passa por órgão do governo"
    ],
    "explicacao": "É um golpe. O INSS nunca pede sua senha por WhatsApp ou link, e informações sobre benefícios e 13º só aparecem no aplicativo oficial Meu INSS ou no site gov.br/inss. Nunca informe sua senha do Meu INSS para ninguém, nem por link."
  },
  {
    "id": "compra-nao-reconhecida",
    "categoria": "Falsa compra não reconhecida",
    "canal": "SMS",
    "remetente": "Cartão de Crédito",
    "mensagem": "Identificamos uma compra de R$ 2.350,00 em seu cartão. Se não reconhece, ligue AGORA para o número 0800-123-4567 ou responda CANCELAR.",
    "isGolpe": true,
    "sinais": [
      "Valor alto para gerar pânico",
      "Urgência (ligue agora)",
      "Número de telefone que não é o do verso do seu cartão"
    ],
    "explicacao": "É um golpe clássico de \"falsa central de cartão\". O valor alto é de propósito, pra assustar e fazer você ligar sem pensar. Se receber algo assim, nunca ligue para o número da mensagem, pegue o número verdadeiro no verso do seu cartão físico ou no aplicativo oficial do banco e confira por lá."
  },
  {
    "id": "doacao-falsa",
    "categoria": "Falsa campanha de doação",
    "canal": "Rede social",
    "remetente": "Página de campanha solidária",
    "mensagem": "Ajude as famílias desabrigadas pela enchente! Qualquer valor ajuda, faça seu Pix para a chave abaixo e compartilhe com seus contatos.",
    "isGolpe": true,
    "sinais": [
      "Chave Pix pessoal, não de uma instituição conhecida",
      "Pede para compartilhar (viralizar) rápido",
      "Não tem como confirmar se a campanha é real"
    ],
    "explicacao": "Pode ser um golpe. Golpistas criam páginas falsas de doação aproveitando tragédias reais, usando uma chave Pix pessoal em vez de uma conta de instituição conhecida (Cruz Vermelha, Defesa Civil, prefeituras). Antes de doar, procure a campanha diretamente no site oficial de uma instituição que você já conhece e confia."
  },
  {
    "id": "leilao-carro-receita",
    "categoria": "Falso leilão de carro da Receita Federal",
    "canal": "Rede social",
    "remetente": "Anúncio patrocinado",
    "mensagem": "LEILÃO RECEITA FEDERAL: carros apreendidos a partir de R$ 3.000! Vagas limitadas, garanta a sua com um sinal de R$ 200 pelo Pix.",
    "isGolpe": true,
    "sinais": [
      "Preço absurdamente baixo para um carro",
      "Pedido de sinal por Pix antes de qualquer processo oficial",
      "Urgência (vagas limitadas)"
    ],
    "explicacao": "É um golpe. Leilões de verdade da Receita Federal são feitos só por empresas leiloeiras credenciadas, com cadastro, edital público e nunca pedem um \"sinal\" via Pix para um anúncio de rede social. Um carro por R$ 3.000 é bom demais para ser verdade, e é exatamente isso que o golpista quer que você pense."
  },
  {
    "id": "qrcode-estacionamento",
    "categoria": "QR code falso (golpe do Pix Copia e Cola)",
    "canal": "Placa física/QR code",
    "remetente": "Adesivo colado no parquímetro",
    "mensagem": "[QR code colado por cima do oficial, com o texto] \"Pague seu estacionamento rotativo digital aqui\"",
    "isGolpe": true,
    "sinais": [
      "QR code colado por cima do oficial (adesivo solto)",
      "Não tem como conferir se é o sistema oficial da prefeitura",
      "Pressa de quem está estacionando"
    ],
    "explicacao": "É um golpe comum em estacionamentos e parquímetros: golpistas colam um adesivo com QR code falso por cima do oficial, levando o Pix direto pra conta deles. Antes de escanear, confira se o QR code não está colado por cima de outro, por desconfie de adesivos soltos ou mal colados, e prefira pagar pelo aplicativo oficial da prefeitura, baixado direto da loja de aplicativos."
  },
  {
    "id": "investimento-cripto",
    "categoria": "Falso investimento em criptomoeda",
    "canal": "WhatsApp",
    "remetente": "\"Consultor de investimentos\"",
    "mensagem": "Olá! Estou ajudando um grupo seleto a multiplicar o capital investindo em criptomoedas, rendimento de 15% ao mês garantido. Já tenho vários clientes satisfeitos, começamos com apenas R$ 500.",
    "isGolpe": true,
    "sinais": [
      "Promessa de rendimento garantido muito alto (15% ao mês)",
      "Contato não solicitado oferecendo investimento",
      "Pressão para começar logo, com valor baixo"
    ],
    "explicacao": "É um golpe de investimento (conhecido como \"pirâmide financeira\" ou fraude de criptomoeda). Nenhum investimento sério garante um rendimento fixo desse tamanho, investimento sempre tem risco. Esses esquemas pagam os primeiros investidores com o dinheiro dos novos, até quebrarem e sumirem com tudo. Desconfie de qualquer oferta de investimento que chegue por WhatsApp."
  },
  {
    "id": "portabilidade-chip",
    "categoria": "Falsa operadora (portabilidade/troca de chip)",
    "canal": "Ligação",
    "remetente": "\"Atendente da operadora\"",
    "mensagem": "Estamos atualizando nosso sistema e seu chip precisa ser reativado. Vou te passar um código por SMS, pode me confirmar os números assim que chegar?",
    "isGolpe": true,
    "sinais": [
      "Pedido do código que chega por SMS",
      "Desculpa de \"atualização de sistema\"",
      "Contato não solicitado da operadora"
    ],
    "explicacao": "É um golpe de troca de chip (SIM swap). Esse código serve pra transferir seu número de telefone para um chip na mão do golpista, depois disso ele recebe todos os seus códigos de SMS, inclusive os do banco. Operadoras de verdade não ligam pedindo esse tipo de confirmação. Nunca repasse códigos recebidos por SMS para ninguém."
  },
  {
    "id": "netflix-suspensa",
    "categoria": "Falsa suspensão de assinatura de streaming",
    "canal": "E-mail",
    "remetente": "\"Netflix\"",
    "mensagem": "Não conseguimos processar o pagamento da sua assinatura. Atualize seus dados de cartão agora para evitar a suspensão da sua conta: netflix-pagamentos.com/atualizar",
    "isGolpe": true,
    "sinais": [
      "Link que não é o site oficial (netflix.com)",
      "Urgência (evitar suspensão)",
      "Pedido de dados do cartão por link de e-mail"
    ],
    "explicacao": "É um golpe de phishing. O endereço \"netflix-pagamentos.com\" não é o site oficial da Netflix, que é sempre netflix.com. Se tiver dúvida sobre pagamento, abra o aplicativo oficial da Netflix direto (sem clicar em nenhum link) e confira por lá."
  },
  {
    "id": "emprego-exterior",
    "categoria": "Falsa vaga de emprego no exterior",
    "canal": "Rede social",
    "remetente": "Anúncio de vaga",
    "mensagem": "Vaga para trabalhar em Portugal, salário em euros, alimentação e moradia inclusas! Só precisamos de uma taxa de processamento de visto de R$ 450 para dar entrada na documentação.",
    "isGolpe": true,
    "sinais": [
      "Pedido de pagamento adiantado para \"processar\" visto",
      "Vaga muito vantajosa anunciada em rede social",
      "Promessa de salário em moeda estrangeira"
    ],
    "explicacao": "É um golpe. Processos de visto de trabalho de verdade são feitos direto com o consulado do país ou com uma agência de recrutamento verificável, nunca cobrando uma \"taxa\" solta por mensagem antes de qualquer contrato. Desconfie de vagas no exterior anunciadas assim, sem empresa identificável."
  },
  {
    "id": "emprestimo-taxa-antecipada",
    "categoria": "Falso empréstimo fácil",
    "canal": "WhatsApp",
    "remetente": "\"Crédito Fácil\"",
    "mensagem": "Seu nome foi pré-aprovado para um empréstimo de R$ 5.000 sem consulta ao SPC/Serasa! Para liberar o valor na sua conta, é necessário pagar uma taxa de seguro de R$ 180.",
    "isGolpe": true,
    "sinais": [
      "Pedido de pagamento antes de liberar o empréstimo",
      "Promessa de aprovação garantida \"sem consulta\"",
      "Contato não solicitado"
    ],
    "explicacao": "É um golpe. Empréstimo de verdade nunca pede um pagamento antecipado para liberar o dinheiro, qualquer taxa ou seguro é descontado do próprio valor emprestado, nunca pago antes. \"Empréstimo aprovado sem consulta\" é a isca clássica desse golpe."
  },
  {
    "id": "central-cartao-bloqueio",
    "categoria": "Falsa central de cartão (recolhimento por motoboy)",
    "canal": "Ligação",
    "remetente": "\"Segurança do banco\"",
    "mensagem": "Detectamos uma tentativa de compra suspeita no seu cartão. Por segurança, vamos enviar um motoboy para recolher o cartão físico e trazer um novo chip de proteção ainda hoje.",
    "isGolpe": true,
    "sinais": [
      "Pedido para entregar o cartão físico a um motoboy",
      "Urgência (ainda hoje)",
      "Se passa por segurança do banco"
    ],
    "explicacao": "É um golpe. Nenhum banco recolhe cartão por motoboy, isso é só um jeito de pegar seu cartão de verdade na mão. Se receber uma ligação assim, desligue e ligue você mesmo pro número oficial do banco (atrás do cartão ou no aplicativo) para confirmar."
  },
  {
    "id": "grupo-telegram-investimento",
    "categoria": "Grupo fechado de \"mentoria\" de investimentos",
    "canal": "Telegram",
    "remetente": "Administrador do grupo",
    "mensagem": "Você foi adicionado ao grupo VIP de sinais de investimento! Hoje é o último dia para garantir acesso vitalício por apenas R$ 97, amanhã o valor sobe para R$ 500.",
    "isGolpe": true,
    "sinais": [
      "Foi adicionado sem pedir",
      "Urgência (último dia, preço sobe amanhã)",
      "Promessa de \"sinais\" de investimento garantidos"
    ],
    "explicacao": "É um golpe. Ser adicionado sem pedir a um grupo que promete ganhos fáceis, com um prazo apertado pra criar pressa, é um padrão clássico de golpe. Investimento sério não funciona com \"sinais\" vendidos em grupo de mensagens, e decisão de investir nunca deveria ser tomada com pressa."
  },
  {
    "id": "vale-presente-falso",
    "categoria": "Falso vale-presente de loja famosa",
    "canal": "WhatsApp",
    "remetente": "\"Promoção Oficial\"",
    "mensagem": "PARABÉNS! Você foi sorteado(a) com um vale-presente de R$ 500 em uma grande rede de supermercados. Responda esta pesquisa rápida com seus dados para resgatar.",
    "isGolpe": true,
    "sinais": [
      "Sorteio que você não participou",
      "Pedido de dados pessoais numa \"pesquisa\"",
      "Promoção que não veio do canal oficial da loja"
    ],
    "explicacao": "É um golpe. Lojas de verdade não avisam sorteios por mensagens assim, promoções oficiais são divulgadas nos canais próprios da empresa (site, aplicativo, redes sociais verificadas). O objetivo dessa \"pesquisa\" é só coletar seus dados pessoais."
  },
  {
    "id": "pesquisa-paga-dados",
    "categoria": "Falsa pesquisa remunerada",
    "canal": "E-mail",
    "remetente": "\"Instituto de Pesquisa\"",
    "mensagem": "Responda nossa pesquisa de opinião e receba R$ 150 de recompensa! Para o depósito, informe seu nome completo, CPF e dados bancários completos no formulário.",
    "isGolpe": true,
    "sinais": [
      "Pedido de dados bancários completos",
      "Recompensa alta para uma simples pesquisa",
      "Empresa não identificável"
    ],
    "explicacao": "É um golpe de coleta de dados. Pesquisas remuneradas de verdade raramente pedem dados bancários completos logo de cara, geralmente pagam por Pix só com a chave, sem precisar de todos os seus dados bancários. O objetivo aqui é roubar suas informações pessoais e bancárias."
  },
  {
    "id": "consulta-medica-legitima",
    "categoria": "Lembrete real de consulta médica",
    "canal": "SMS",
    "remetente": "UBS / Clínica",
    "mensagem": "Lembrete: sua consulta está marcada para amanhã às 14h com Dr. Carlos. Em caso de impedimento, ligue para a unidade para remarcar.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É um lembrete simples, sem pedido de pagamento, sem link e sem dado sensível solicitado, só uma confirmação de horário."
  },
  {
    "id": "rastreio-legitimo",
    "categoria": "Código de rastreio real de encomenda",
    "canal": "SMS",
    "remetente": "Transportadora",
    "mensagem": "Seu pedido #88341 está a caminho. Código de rastreio: BR123456789. Acompanhe no site oficial da transportadora.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. Não pede pagamento nem clique em link suspeito, só informa o código de rastreio e orienta a conferir no site oficial, o jeito mais seguro de acompanhar uma encomenda."
  },
  {
    "id": "grupo-familia-legitimo",
    "categoria": "Mensagem real de grupo de família",
    "canal": "WhatsApp",
    "remetente": "Grupo \"Família\"",
    "mensagem": "Gente, confirmando o almoço de domingo na casa da vovó, 13h! Quem vai levar sobremesa?",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É uma conversa comum de grupo de família, sem pedido de dinheiro nem nenhum sinal de alerta."
  },
  {
    "id": "vacina-legitima",
    "categoria": "Lembrete real de vacina",
    "canal": "SMS",
    "remetente": "Posto de Saúde",
    "mensagem": "Sua segunda dose da vacina está disponível. Compareça ao posto de saúde mais próximo com a carteira de vacinação.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. Não pede nenhum dado, nenhum pagamento e nenhum link, só orienta a comparecer pessoalmente ao posto de saúde com a carteirinha."
  },
  {
    "id": "nota-fiscal-legitima",
    "categoria": "Confirmação real de compra",
    "canal": "E-mail",
    "remetente": "Loja onde você comprou",
    "mensagem": "Obrigado pela sua compra! Em anexo está a nota fiscal do pedido #5521. Nenhuma ação é necessária da sua parte.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. Confirma uma compra que você já fez, não pede nada em troca e não tem link estranho pra clicar, só um comprovante."
  },
  {
    "id": "reuniao-escola-legitima",
    "categoria": "Aviso real da escola",
    "canal": "WhatsApp",
    "remetente": "Grupo da turma do neto/neta",
    "mensagem": "Avisando que a reunião de pais será na sexta-feira às 19h, no auditório da escola. Presença importante!",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É um aviso comum de escola, sem pedido de dinheiro ou dado sensível, só uma informação de horário e local."
  },
  {
    "id": "pix-recebido-legitimo",
    "categoria": "Notificação real do aplicativo do banco",
    "canal": "Notificação do aplicativo",
    "remetente": "Banco",
    "mensagem": "Você recebeu um Pix de R$ 50,00 de João Silva às 10:42. Consulte os detalhes no aplicativo.",
    "isGolpe": false,
    "sinais": [],
    "explicacao": "Não é golpe. É uma notificação automática do próprio aplicativo do banco avisando sobre uma movimentação, sem pedir nenhuma ação sua."
  }
];
