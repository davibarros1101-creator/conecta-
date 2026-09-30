# Conecta+

**Pessoas reais. Conexões seguras.**

Ferramenta educativa para ajudar pessoas com 60 anos ou mais a reconhecer golpes digitais na prática: a pessoa vê uma situação (mensagem, ligação, pedido) parecida com o que encontraria de verdade, decide se é golpe ou não, e recebe uma explicação com os sinais de alerta.

🔗 **Site no ar:** https://conecta-mais-theta.vercel.app
🔗 **Código-fonte:** https://github.com/davibarros1101-creator/conecta-

## Resumo do projeto

| | |
|---|---|
| **Problema** | Pessoas 60+ são o público mais visado por golpes digitais (falso banco, falso parente, falso boleto, falso sequestro etc.) e raramente têm onde treinar a reconhecer os sinais antes de cair num golpe de verdade. |
| **Solução** | Um espaço de prática seguro (observe → decida → aprenda), mais duas ferramentas de verificação real: leitura de print/texto com IA (OCR) pra apontar sinais de golpe numa mensagem recebida de verdade, e comparação de rosto pela webcam pra checar se quem está numa videochamada é realmente a pessoa de confiança cadastrada. |
| **Formato** | Site/PWA (instalável, funciona offline) **e** extensão de navegador (Chrome/Edge). |
| **Dado sensível?** | Sim, opcionalmente - rosto cadastrado (biométrico) para a função "Verificar rosto". Tratado com cuidado: nunca sai do navegador da pessoa, sem servidor, sem conta, ver `web/privacidade.html`. |
| **Stack** | HTML/CSS/JS puros, sem framework nem build. Duas bibliotecas de IA carregadas por CDN e rodando 100% no navegador: Tesseract.js (OCR) e face-api.js (reconhecimento de rosto). |

## Como testar

**Direto no navegador, sem instalar nada:** https://conecta-mais-theta.vercel.app

Ou localmente, com o servidor rodando (ver "Como abrir o site" abaixo):

**http://localhost:5566**

Páginas principais:
- Início: `index.html`
- Praticar: `praticar.html`
- Verificar mensagem (OCR + detector de golpe): `verificar.html`
- Verificar rosto (webcam + comparação facial): `verificar-rosto.html`
- Meu progresso: `historico.html`
- Política de privacidade: `privacidade.html`

## Estrutura do projeto

```
conecta-mais/
├── web/          Site/PWA (funciona sozinho, sem servidor, dá pra abrir index.html direto)
├── extension/    Extensão de navegador (Chrome/Edge, Manifest V3)
├── shared/       Cenários de prática (fonte de verdade: scenarios.json/scenarios.js)
└── README.md
```

O arquivo `shared/scenarios.js` é copiado tanto pra `web/assets/scenarios.js` quanto pra `extension/scenarios.js`, porque a extensão só consegue carregar arquivos de dentro da própria pasta. **Se for editar os cenários, edite `shared/scenarios.json` (ou .js) e copie pros dois lugares de novo.**

## Como abrir o site

Sem instalar nada: abra `web/index.html` direto no navegador (duplo clique). Também funciona rodando um servidor local simples, se preferir:

```bash
cd web
npx serve .
```

O site é um PWA - em celular ou computador, o navegador oferece "Instalar app", que passa a funcionar como um aplicativo de verdade (ícone próprio, abre sem barra de endereço, funciona offline pras partes que não dependem de IA online).

## Como instalar a extensão (modo desenvolvedor)

1. Abra `chrome://extensions` (ou `edge://extensions` no Edge)
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"** ("Load unpacked")
4. Selecione a pasta `extension/` inteira (não uma subpasta como `icons` ou `tesseract`)
5. O ícone do Conecta+ aparece na barra de extensões, clique para abrir o popup de prática

## Funcionalidades

### Praticar
14 situações simuladas, uma por vez: observe a mensagem, decida se é golpe, veja a explicação. Tem botão de **ouvir a mensagem em voz alta** (usa a função de fala do próprio navegador), útil pra quem tem dificuldade de leitura na tela.

### Verificar mensagem (OCR + detector de golpe/spam)
Página `web/verificar.html`: a pessoa envia um print (foto de tela do WhatsApp, e-mail, SMS, ou qualquer imagem com texto) ou cola o texto direto. O OCR (Tesseract.js, roda 100% no navegador, a imagem não é enviada a nenhum servidor) lê o texto, e `web/js/scamDetector.js` analisa em busca de sinais reais de golpe (pedido de dinheiro, urgência, prêmio, pedido de senha/código, link suspeito, suporte técnico falso, PIX "por engano", investimento com lucro garantido, falsa vaga de emprego, falso sequestro, falsa central de cartão, boleto clonado, pedido de selfie/documento) e de spam (excesso de maiúsculas/exclamação, propaganda agressiva), classificando o risco em alto, atenção ou baixo, com explicação. Também reconhece quando a imagem parece um documento/conta oficial de verdade (código de barras, CNPJ, vencimento), com o cuidado de avisar que isso sozinho não garante que o beneficiário é o certo (golpe do boleto clonado).

A extensão também tem essa funcionalidade (`extension/verificar.html`, aberta numa aba nova a partir do popup, já que um OCR demorado não cabe no popup, que fecha sozinho se perder o foco). O Tesseract.js vem empacotado localmente em `extension/tesseract/` (worker + core WASM + dados de idioma em português, cerca de 20MB), já que o Manifest V3 não deixa carregar scripts de CDN.

### Verificar rosto (comparação facial pela webcam)
Página `web/verificar-rosto.html`: cadastre o rosto de uma pessoa de confiança (câmera ao vivo ou foto enviada) e, numa videochamada estranha, compare na hora se é realmente ela. Usa face-api.js (modelos carregados de CDN, processamento 100% local). Suporta mais de uma foto por pessoa (compara pela mais parecida), editar nome, excluir, e exportar/importar o cadastro em JSON. Deixa claro que é um apoio, não uma prova - a recomendação é sempre confirmar também por outro meio (ligação de voz).

### Meu progresso
Página `web/historico.html`: gráfico simples mostrando a evolução da pontuação ao longo das tentativas, com comparação "primeira tentativa x mais recente" em texto, e uma tabela equivalente acessível logo abaixo do gráfico (pra leitor de tela). Útil pra medir aprendizado numa apresentação (ex.: "antes: 4 de 14, depois: 12 de 14").

### Acessibilidade
Botão "A+" (todas as páginas) aumenta o texto e o contraste, com preferência salva. Base de fonte já maior que o padrão do navegador de propósito, pensando no público 60+.

### Tour guiado
Botão flutuante (ícone de bússola) em todas as páginas principais, explicando cada parte da tela passo a passo.

### Novidades / aviso de atualização
Sino no canto da home mostra as últimas atualizações publicadas, escritas em linguagem simples pro usuário final (não é um log técnico). Quando uma atualização nova é publicada, quem já usava o site recebe um aviso "O Conecta+ foi atualizado" sozinho, com atalho pra ver o que mudou. Configurado em `web/js/changelog-data.js`.

## Notas técnicas (coisas que já deram bug de verdade)

- **`[hidden]` perde de classes com `display`**: um elemento com o atributo `hidden` pode continuar visível se alguma classe CSS (ex.: `.btn { display: flex }`) tiver a mesma especificidade e carregar depois. Corrigido com uma regra global `[hidden] { display: none !important; }` em todas as folhas de estilo do projeto.
- **`background-clip: text` some se outra regra reescreve `background`**: o destaque do tour guiado (`.tour-highlight`) não pode definir `background` em cima de um elemento com texto em gradiente (como o título "Conecta+"), senão o `background` do gradiente é substituído e o texto vira um retângulo sólido. O destaque usa só contorno (outline), sem mexer no fundo.
- **Manifest V3 e Tesseract.js**: veja a seção "Verificar mensagem" acima. Resumo: `content_security_policy.extension_pages` precisa de `'wasm-unsafe-eval'`, `web_accessible_resources` precisa listar `tesseract/*`, e o Tesseract precisa rodar com `workerBlobURL: false` (senão o `importScripts` de dentro de um Blob é bloqueado pela política de segurança, mesmo com arquivo 100% local).
- **Service worker é rede-primeiro (network-first)**: todo fetch tenta a rede primeiro e só cai pro cache se estiver offline. Isso evita o problema comum de quem já visitou o site continuar vendo uma versão antiga depois de uma atualização.
- **Botões fixos (position:fixed) podem esconder botões reais da página**: o tour e o "A+" ficam fixos no canto da tela; um botão de largura total (ex.: "Cadastrar rosto", "SIM" na prática) pode acabar embaixo deles dependendo do quanto a página rolou, principalmente em celular. Corrigido reduzindo o tamanho dos dois, empilhando no mesmo canto (em vez de um em cada lado) e deixando semi-transparentes por padrão (sólidos só no hover/foco), pra nunca bloquear 100% o que está embaixo.
- **Extensões de leitura/tradução do navegador podem reformatar a página inteira**: um usuário real relatou não achar o botão de cadastro; o motivo era um modo de leitura simplificada do navegador (tipo Immersive Reader), que remove botões e reformata todo o texto - reproduzível até no google.com, então não tinha relação com o código do site. Adicionado um aviso explicativo na própria página.

## Conteúdo educativo

14 situações simuladas: golpes reais (prêmio falso, banco falso, WhatsApp de familiar, funcionário de banco falso, link falso de encomenda, falso benefício, falso suporte técnico, golpe do amor, boleto clonado, pedido de selfie/documento) e mensagens legítimas, para treinar a pessoa a diferenciar. Responder sempre "é golpe" não garante nota máxima.

O resultado de cada tentativa fica salvo no navegador (localStorage), sem enviar nada pra nenhum servidor.

## Privacidade

Nada é enviado a servidor nenhum - nem mensagens analisadas, nem fotos, nem rostos cadastrados. Tudo roda e fica guardado só no navegador da pessoa (`localStorage`). Sem conta, sem login, sem cookies de rastreamento. Detalhes em `web/privacidade.html`.

## Tecnologias

HTML, CSS e JavaScript puros, sem build nem dependências de projeto. Duas bibliotecas externas, carregadas via CDN e usadas só onde fazem falta:
- **Tesseract.js** - OCR (leitura de texto em imagem), na verificação de mensagem.
- **face-api.js** - detecção e comparação de rosto, na verificação de rosto.

Publicado na Vercel (site) e testado com Playwright (testes end-to-end reais, incluindo webcam simulada com fotos reais pra validar o reconhecimento facial de ponta a ponta antes de cada publicação).
