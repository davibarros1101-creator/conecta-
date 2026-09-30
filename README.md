# Conecta+

**Pessoas reais. Conexões seguras.**

Ferramenta educativa para ajudar pessoas com 60 anos ou mais a reconhecer golpes digitais na prática: a pessoa vê uma situação (mensagem, ligação, pedido) parecida com o que encontraria de verdade, decide se é golpe ou não, e recebe uma explicação com os sinais de alerta.

## Como testar agora, localmente

O projeto ainda não está publicado na internet, só roda no seu computador. Com o servidor local rodando, acesse:

**http://localhost:5566**

Páginas principais:
- Início: http://localhost:5566/index.html
- Praticar: http://localhost:5566/praticar.html
- Verificar mensagem (OCR): http://localhost:5566/verificar.html
- Meu progresso: http://localhost:5566/historico.html

Se o servidor não estiver rodando, veja "Como abrir o site" mais abaixo.

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

O site é um PWA, em celular o navegador vai oferecer "Instalar app" assim que estiver publicado num endereço público (instalação não funciona em `file://` nem, em alguns navegadores, em `localhost`).

## Como instalar a extensão (modo desenvolvedor)

1. Abra `chrome://extensions` (ou `edge://extensions` no Edge)
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"** ("Load unpacked")
4. Selecione a pasta `extension/` inteira (não uma subpasta como `icons` ou `tesseract`)
5. O ícone do Conecta+ aparece na barra de extensões, clique para abrir o popup de prática

## Funcionalidades

### Praticar
12 situações simuladas, uma por vez: observe a mensagem, decida se é golpe, veja a explicação. Tem botão de **ouvir a mensagem em voz alta** (usa a função de fala do próprio navegador), útil pra quem tem dificuldade de leitura na tela.

### Verificar mensagem (OCR + detector de golpe/spam)
Página `web/verificar.html`: a pessoa envia um print (foto de tela do WhatsApp, e-mail, SMS, ou qualquer imagem com texto) ou cola o texto direto. O OCR (Tesseract.js, roda 100% no navegador, a imagem não é enviada a nenhum servidor) lê o texto, e `web/js/scamDetector.js` analisa em busca de sinais reais de golpe (pedido de dinheiro, urgência, prêmio, pedido de senha/código, link suspeito, suporte técnico falso) e de spam (excesso de maiúsculas/exclamação, propaganda agressiva), classificando o risco em alto, atenção ou baixo, com explicação.

A extensão também tem essa funcionalidade (`extension/verificar.html`, aberta numa aba nova a partir do popup, já que um OCR demorado não cabe no popup, que fecha sozinho se perder o foco). O Tesseract.js vem empacotado localmente em `extension/tesseract/` (worker + core WASM + dados de idioma em português, cerca de 20MB), já que o Manifest V3 não deixa carregar scripts de CDN.

### Meu progresso
Página `web/historico.html`: gráfico simples mostrando a evolução da pontuação ao longo das tentativas, com comparação "primeira tentativa x mais recente" em texto, e uma tabela equivalente acessível logo abaixo do gráfico (pra leitor de tela). Útil pra medir aprendizado numa apresentação (ex.: "antes: 4 de 12, depois: 10 de 12").

### Tour guiado
Botão flutuante (ícone de bússola, canto inferior esquerdo) em todas as páginas principais, explicando cada parte da tela passo a passo.

### Novidades / aviso de atualização
Sino no canto da home mostra as últimas atualizações publicadas, escritas em linguagem simples pro usuário final (não é um log técnico). Quando uma atualização nova é publicada, quem já usava o site recebe um aviso "O Conecta+ foi atualizado" sozinho, com atalho pra ver o que mudou. Configurado em `web/js/changelog-data.js`.

## Notas técnicas (coisas que já deram bug de verdade)

- **`[hidden]` perde de classes com `display`**: um elemento com o atributo `hidden` pode continuar visível se alguma classe CSS (ex.: `.btn { display: flex }`) tiver a mesma especificidade e carregar depois. Corrigido com uma regra global `[hidden] { display: none !important; }` em todas as folhas de estilo do projeto.
- **`background-clip: text` some se outra regra reescreve `background`**: o destaque do tour guiado (`.tour-highlight`) não pode definir `background` em cima de um elemento com texto em gradiente (como o título "Conecta+"), senão o `background` do gradiente é substituído e o texto vira um retângulo sólido. O destaque usa só contorno (outline), sem mexer no fundo.
- **Manifest V3 e Tesseract.js**: veja a seção "Verificar mensagem" acima. Resumo: `content_security_policy.extension_pages` precisa de `'wasm-unsafe-eval'`, `web_accessible_resources` precisa listar `tesseract/*`, e o Tesseract precisa rodar com `workerBlobURL: false` (senão o `importScripts` de dentro de um Blob é bloqueado pela política de segurança, mesmo com arquivo 100% local).
- **Service worker é rede-primeiro (network-first)**: todo fetch tenta a rede primeiro e só cai pro cache se estiver offline. Isso evita o problema comum de quem já visitou o site continuar vendo uma versão antiga depois de uma atualização.

## Conteúdo educativo

12 situações simuladas: 8 golpes reais (prêmio falso, banco falso, WhatsApp de familiar, funcionário de banco falso, link falso de encomenda, falso benefício, falso suporte técnico, golpe do amor) e 4 mensagens legítimas, para treinar a pessoa a diferenciar. Responder sempre "é golpe" não garante nota máxima.

O resultado de cada tentativa fica salvo no navegador (localStorage), sem enviar nada pra nenhum servidor.

## Tecnologias

HTML, CSS e JavaScript puros, sem build nem dependências de projeto (a única biblioteca externa é o Tesseract.js, usado só na verificação de mensagem). De propósito, pra rodar em qualquer navegador sem precisar instalar nada.
