# DropRadar BR — pesquisa pessoal com fontes

Ferramenta para pesquisar produtos e fornecedores, registrar cotações e simular resultados por pedido. Não executa vendas, pagamentos, pedidos nem fulfillment.

## O que é real e o que é uma hipótese

- **Pesquisa gratuita:** busca automática opcional pela Tavily (cota gratuita), retornando títulos, URLs e trechos efetivamente recebidos, com data da consulta. Não solicita respostas geradas por IA. Sem configuração, prepara links de pesquisa no Google, DuckDuckGo e Mercado Livre sem chave ou assinatura de API. Os resultados são consultados no próprio site. A busca automática exibe resultados da fonte; não extrai preços, estoque ou avaliações como dados comerciais confirmados. Registre manualmente os dados confirmados e a URL de origem.
- **Fornecedores iniciais:** Printful e CJdropshipping, com links dos próprios sites consultados em 30/09/2026. Isso documenta a existência e a oferta anunciada, não uma auditoria de qualidade, contrato, disponibilidade no Brasil ou certificação. Não há WhatsApps, notas ou avaliações presumidas.
- **Produtos:** catálogo inicialmente vazio. Cadastre um produto após pesquisa e cotação, informando sua URL de origem. Custo, frete, preço de venda e CPA são valores informados pelo usuário; não são métricas obtidas automaticamente de marketplaces.
- **Calculadora:** não presume alíquotas legais, regime tributário ou adesão ao Remessa Conforme. Informe o total de tributos da cotação atual e evite duplicar impostos já incluídos no custo. As taxas inicialmente zeradas não significam isenção. Inclua custos de operação e devoluções no campo de outros custos por pedido.
- **IA:** cria apenas um rascunho comercial baseado nas características informadas. Não mede demanda nem confirma características; revise a saída. Sem chave, retorna erro de configuração, nunca uma resposta fictícia.

## Executar localmente

Requer Node.js >= 22.18.0 e npm.

```bash
npm ci
cp .env.example .env.local
```

Configure `.env.local`:

```dotenv
APP_ACCESS_TOKEN=
# Token para as APIs opcionais Tavily e Gemini; pesquisa direta não exige token.
TAVILY_API_KEY=sua_chave_tavily_opcional
GEMINI_API_KEY=sua_chave_gemini_opcional
GEMINI_MODEL=gemini-3.8-flash
```

A Brave foi removida. A pesquisa direta não precisa de chave ou assinatura. A Tavily é opcional e exige uma chave do plano gratuito. A busca por feed público foi descartada porque os testes retornaram listas vazias ou resultados sem relação com o termo pesquisado. O aplicativo não apresenta esse conteúdo como pesquisa válida.

Para testar pesquisa, catálogo e calculadora, não configure nenhuma credencial. Para usar o gerador opcional de anúncios, configure `APP_ACCESS_TOKEN` com pelo menos 24 caracteres (gere com `openssl rand -hex 32`) e `GEMINI_API_KEY`, obtida em https://aistudio.google.com/ . A IA é opcional e o custo/quota depende da sua conta. Nenhuma chave é incluída no repositório ou enviada ao navegador.

```bash
npm run dev
```

Abra http://localhost:3000, digite um produto ou fornecedor e clique em **Preparar pesquisa gratuita**. Escolha um dos sites para consultar resultados reais. Confira a página do vendedor, custo, frete e disponibilidade; depois use **+ Produto** ou **+ Fornecedor** para salvar a cotação e seu link. A pesquisa não exige token, mesmo quando o token do gerador está configurado.

Uma eventual `BRAVE_SEARCH_API_KEY` antiga em `.env.local` não é utilizada e pode ser removida. Preserve as outras configurações. Catálogo, calculadora, checklist e backups continuam funcionando sem APIs. A busca automática está implementada com Tavily; obter catálogos, cotações e estoques por APIs dos fornecedores permanece pendente.

### Ativar a busca automática gratuita (Tavily)

1. Cadastre-se em https://app.tavily.com/ e escolha **Researcher / Free**, sem cartão e sem ativar Pay As You Go. A página oficial informa 1.000 créditos por mês. Busca básica custa 1 crédito; outras operações da sua conta também consomem o saldo.
2. No Termux, pare o servidor e edite `.env.local` com `nano .env.local`. Adicione `TAVILY_API_KEY` e um `APP_ACCESS_TOKEN` pessoal de pelo menos 24 caracteres. Gere o token com `openssl rand -hex 32`. Preserve as outras variáveis. Não publique esse arquivo nem envie suas chaves no chat.
3. Reinicie `npm run dev:termux`. No app, abra **Acesso às APIs opcionais**, informe apenas o token pessoal e marque **Busca automática com Tavily**.
4. Consulte um produto ou fornecedor. O app mostra os resultados e suas fontes. Confira as condições comerciais no site original antes de cadastrar uma cotação.

O pedido fixa `search_depth: basic`, `auto_parameters: false` e `include_answer: false`. Não há migração automática de provedor, compra de créditos ou alteração de plano no app. Quando a fonte limita o acesso ou a quota acaba, a consulta falha com uma mensagem e os links de pesquisa direta continuam disponíveis. A aplicação não controla o faturamento da conta: mantenha o plano gratuito sem Pay As You Go. Não foi feita consulta real autenticada à Tavily porque nenhuma chave foi fornecida; os testes usam fixtures explicitamente identificadas para verificar integração, consumo básico e erros, sem alimentar o catálogo.

## Testar no Android com Termux

O compilador de CSS usa Tailwind 3/PostCSS em JavaScript para não depender do binário Lightning CSS ausente no ambiente Android relatado. A configuração de desenvolvimento no Android também desativa o cache persistente do Webpack e ignora apenas os diretórios ancestrais protegidos `/`, `/data` e `/data/data`. As pastas do projeto continuam sendo observadas.

Para atualizar uma cópia já instalada, pare o servidor com Ctrl+C e execute dentro do projeto:

```bash
git pull --ff-only origin main
npm ci
npm run clean
npm run dev:termux
```

Não copie `.env.example` novamente por cima de `.env.local`: preserve suas configurações. Abra http://127.0.0.1:3000 no navegador do mesmo celular e mantenha o Termux ativo. A primeira compilação pode ser lenta. Não é necessário root nem conceder acesso aos diretórios protegidos do Android.

O teste `npm run test:termux` ativa a mesma configuração do Android via `TERMUX_DEV=1` em Linux, inicia o servidor de desenvolvimento e exige que a página compile com HTTP 200. Isso verifica o esquema do Webpack, não emula o aparelho Android. A compilação e as verificações foram feitas em Linux; o aparelho Termux do usuário ainda precisa confirmar o funcionamento. Se aparecer outro erro, registre a mensagem completa. Instalação e execução devem ficar no diretório privado do Termux (`~/Projeto-DropShipping`), não no armazenamento compartilhado do Android.

## Segurança e limites do uso pessoal

As APIs Tavily e Gemini exigem token com no mínimo 24 caracteres e comparação em tempo constante. Cada função mantém limite de corpo de 8 KB, validação de campos, timeout externo e até 30 chamadas por hora/processo. O limite reinicia quando o processo reinicia e não é compartilhado entre instâncias. No modo direto, a rota de pesquisa apenas prepara links validados, com corpo limitado a 8 KB e termo de até 200 caracteres; não chama serviços externos nem usa credenciais. Para uso público/multiusuário, substitua o acesso à IA por autenticação individual e quotas compartilhadas. Quem possui o token pode consumir sua quota; não compartilhe o token pessoal.

## Dados e backup

Produtos, fornecedores e checklist ficam no navegador: não existe banco central nem sincronização. Use **Baixar backup pessoal** regularmente e antes de **Restaurar backup**, que substitui os cadastros atuais. Backups de até 5 MB são validados antes da gravação; URLs não seguras são rejeitadas. O backup não inclui tokens ou chaves de API. Os dados antigos permanecem nas chaves v1 como cópia local: a migração importa somente cadastros pessoais estruturalmente válidos e remove números de vendas e verificação automática. O catálogo demonstrativo antigo não é reapresentado. Exportação CSV/JSON é genérica e exige adaptação ao importador da loja.

## Verificação

```bash
npm test
npm run lint
npm run typecheck
npm run test:termux
npm run build
npm run test:smoke
npm audit
```

Os testes cobrem taxas zeradas, tributos cotados, custos operacionais, ausência de equilíbrio, margem positiva estreita, URLs de pesquisa e validação de backup. O teste de produção verifica que a pesquisa prepara links sem token, inclusive quando existe um token configurado para IA, além de validar limites e proteção do gerador. A integração Tavily foi validada com respostas de teste, sem consulta autenticada real. Ela solicita resultados de busca reais quando configurada; nunca usa fixtures em produção. Chamadas reais ao Gemini dependem das suas credenciais e não foram testadas.

## Fontes técnicas e comerciais

- Pesquisa direta: https://www.google.com/ , https://duckduckgo.com/ e https://www.mercadolivre.com.br/
- Tavily: https://www.tavily.com/pricing e https://docs.tavily.com/documentation/api-reference/endpoint/search
- Gemini: https://ai.google.dev/gemini-api/docs/models
- Printful: https://www.printful.com/how-printful-works/on-demand-drop-shipping
- CJdropshipping: https://cjdropshipping.com/welcome.html

## Próximas integrações

Conectar catálogos/cotações de fornecedores por APIs oficiais com credenciais da sua conta; persistência em banco com acesso pessoal; comparação histórica de preços; verificação de CNPJ para empresas brasileiras quando houver identificação fornecida. A busca web atual não substitui esses recursos nem representa tendência de vendas.

O repositório original não contém licença. Esta atualização não atribui uma licença ao código de terceiros.
