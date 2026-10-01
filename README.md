# DropRadar BR — pesquisa pessoal com fontes

Ferramenta para pesquisar produtos e fornecedores, registrar cotações e simular resultados por pedido. Não executa vendas, pagamentos, pedidos nem fulfillment.

## Análise completa de oportunidades

A opção inicial **Análise completa** faz três pesquisas basic: candidatos a fornecedor (fabricante/distribuidor/atacado/dropshipping), produtos/preços no varejo e menções de mais vendidos/vendas. Lê automaticamente até cinco URLs desses resultados usando Tavily Extract basic. Consome até quatro créditos por análise; as opções de busca simples continuam consumindo um crédito. A leitura leva até 60 segundos e falhas parciais são informadas. Vídeos e redes sociais são excluídos das buscas.

A tela reúne preços em reais com o contexto original, marca parcelas/mensalidades detectadas, trechos de condições comerciais e menções de vendas. A extração é determinística, sem chamada Gemini. Isso identifica informações publicadas; não identifica automaticamente SKU, variações, estoque disponível ou unidade de venda. Páginas sem evidência ficam ocultas inicialmente e podem ser mostradas por opção. Guias/listas não recebem o botão de cadastro de fornecedor. Uma página de varejo não vira automaticamente um fornecedor aprovado.

Selecione **Usar como custo** e **Usar como preço de venda** nos preços encontrados, ou informe uma cotação. Confirme que os valores são do mesmo produto, unidade/quantidade e preço total. O painel calcula lucro por pedido e margem a partir de custo, preço, frete, outros custos fixos por pedido e taxas percentuais sobre venda. Outros custos incluem anúncios/CPA, embalagem, impostos fixos e operação; valores zerados excluem esses custos. A margem é uma simulação, não lucro observado, e não é calculada automaticamente comparando produtos diferentes.

**Revisar e cadastrar fornecedor** abre o cadastro com a fonte e os trechos preenchidos. **Revisar e cadastrar produto** exige a confirmação da comparação, preços válidos e ao menos uma fonte selecionada; preenche custo, preço, frete e fontes para revisão. A origem precisa ser escolhida antes de salvar. Os registros aparecem no catálogo pessoal após salvar. As URLs de custo e preço ficam preservadas no produto e no backup. Os demais custos da simulação ficam documentados na descrição; a calculadora completa exige que sejam informados novamente. **Baixar análise com fontes** exporta o relatório JSON; o relatório de pesquisa não é salvo automaticamente no catálogo.

“Mais vendidos” é mostrado somente como menção literal de uma fonte, junto ao contexto. Não há ranking auditado, tendência medida, vendas por mês ou pareamento automático entre SKU de fornecedores e marketplaces. Integrações oficiais de catálogo/estoque e dados de vendas ainda são necessárias para oferecer esses indicadores de forma consistente.

## Busca automática e reputação

A pesquisa usa **Tavily Search**, sem chamar Gemini ou Brave. Os resultados mostram títulos, URLs, trechos das páginas e data da consulta dentro do app. Uma consulta vazia é apresentada como vazia; erros nunca geram resultados fictícios. As fontes precisam ser verificadas antes de registrar preço, estoque, frete e condições comerciais. Um resultado encontrado não prova que a empresa oferece dropshipping.

Em **Reputação de fornecedor**, informe o nome exato da empresa. A consulta busca páginas do Reclame AQUI, Trustpilot e Mercado Livre e restringe os resultados a esses domínios. A interface mostra trechos de pesquisa, não uma nota certificada. Confira a identidade da empresa, o período e se a avaliação é do fornecedor ou de um produto. Sem páginas encontradas não significa ausência de reclamações. Não há integração autenticada com as APIs dessas plataformas, nem auditoria de fornecedores.

Cada clique de busca simples faz uma única chamada Tavily com `search_depth: basic`, `auto_parameters: false`, sem resposta gerada, conteúdo bruto ou retries, com timeout de 30 segundos. Segundo a documentação consultada em 30/09/2026, basic consome 1 crédito e o plano Researcher oferece 1.000 créditos mensais sem cartão. Outros usos da conta compartilham esses créditos; consulte o saldo no painel. O app não ativa faturamento ou planos pagos. Quando há limite, informa o erro. Não consulta reputação extra automaticamente para cada resultado, evitando consumo adicional sem necessidade.

A **pesquisa direta** continua preparando links para Google, DuckDuckGo e Mercado Livre sem API ou credenciais. O **gerador de anúncios** continua usando a chave Gemini existente com `gemini-3.5-flash`, sujeito às quotas da sua conta. Ele não participa da busca Tavily.

## Executar ou atualizar no Ubuntu

Requer Node.js >= 22.18.0 e npm. Na primeira instalação, execute `npm ci` e `cp .env.example .env.local`. Para atualizar uma cópia existente, pare o servidor com Ctrl+C:

```bash
cd ~/Projeto-DropShipping
git pull --ff-only origin main
npm ci
nano .env.local
```

Adicione `TAVILY_API_KEY` com a chave obtida em https://app.tavily.com/ e preserve os valores existentes:

```dotenv
APP_ACCESS_TOKEN=seu_token_pessoal_com_pelo_menos_24_caracteres
TAVILY_API_KEY=sua_chave_tavily
GEMINI_API_KEY=sua_chave_gemini_existente
```

Não sobrescreva `.env.local` com o exemplo. Se ainda não houver token, gere com `openssl rand -hex 32`. Chaves ficam somente no servidor; não as envie pelo chat nem publique no GitHub. Brave e a variável antiga `GEMINI_MODEL` são ignorados.

```bash
npm run diagnose:search
npm run dev -- --hostname 127.0.0.1
```

Abra http://127.0.0.1:3000. Em **Acesso às APIs opcionais**, informe somente o valor de `APP_ACCESS_TOKEN`. Deixe a busca automática marcada e use **Análise completa → Pesquisar e analisar**. Para consultas menores, escolha Produtos, Fornecedores ou Reputação de fornecedor e clique em **Buscar na web**. Para cadastrar uma cotação confirmada, use **+ Produto** ou **+ Fornecedor** e registre a URL de origem. Cadastros continuam sendo manuais; os resultados não alteram seu catálogo.

`diagnose:search` carrega `.env.local`, faz uma única busca basic real e informa quantas fontes chegaram, sem imprimir credenciais ou resposta bruta. Consome 1 crédito. Uma consulta concluída pode ter zero resultados. `diagnose:gemini` continua disponível para testar separadamente o recurso Google Search do Gemini, que exige elegibilidade/quota e não é usado pela busca do app. Execute esse diagnóstico apenas se quiser testar esse recurso Google, sujeito às condições em https://ai.google.dev/gemini-api/docs/pricing.

## Dados comerciais e segurança

Produtos começam vazios. Os fornecedores iniciais Printful e CJdropshipping têm URLs oficiais, sem notas inventadas, WhatsApps presumidos ou selo de confiabilidade. A calculadora usa os custos e tributos informados pelo usuário; taxas zeradas não significam isenção. A IA cria apenas rascunhos a partir das características informadas.

As rotas automáticas de busca e geração exigem token de pelo menos 24 caracteres, comparação em tempo constante, corpo de até 8 KB, consulta de até 200 caracteres e limite de 30 chamadas por hora/processo por função. Esse limite reinicia com o processo e não substitui a quota global do provedor. Tokens ficam no sessionStorage da aba. Para disponibilizar a terceiros, implemente autenticação individual, limites compartilhados e armazenamento adequado.

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

## Dados e backup

Produtos, fornecedores e checklist ficam no navegador: não existe banco central nem sincronização. Use **Baixar backup pessoal** regularmente e antes de **Restaurar backup**, que substitui os cadastros atuais. Backups de até 5 MB são validados antes da gravação; URLs não seguras são rejeitadas. O backup não inclui tokens ou chaves de API. Os dados antigos permanecem nas chaves v1 como cópia local: a migração importa somente cadastros pessoais estruturalmente válidos e remove números de vendas e verificação automática. O catálogo demonstrativo antigo não é reapresentado. Exportação CSV/JSON é genérica e exige adaptação ao importador da loja.

## Verificação

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

Os testes usam fixtures explícitas para verificar a requisição basic, fontes HTTPS, restrição dos domínios de reputação e falhas do provedor sem retries. Fixtures nunca são usadas em produção. Também cobrem calculadora, backups, configuração e falhas Gemini. O smoke test verifica a página e as proteções das APIs. A chamada autenticada Tavily precisa ser confirmada no seu ambiente com sua chave; ela não está disponível no ambiente desta atualização.

## Fontes

- Tavily Search: https://docs.tavily.com/documentation/api-reference/endpoint/search
- Créditos e preços: https://docs.tavily.com/documentation/api-credits
- Plano gratuito: https://www.tavily.com/pricing
- Gemini: https://ai.google.dev/gemini-api/docs/pricing
- Printful: https://www.printful.com/how-printful-works/on-demand-drop-shipping
- CJdropshipping: https://cjdropshipping.com/welcome.html

Catálogos, estoque e cotações oficiais dos fornecedores, notas autenticadas das plataformas e sincronização em banco continuam pendentes. A pesquisa web não mede demanda ou vendas. O repositório original não contém licença; esta atualização não atribui uma licença ao código de terceiros.
