# DropRadar BR — pesquisa pessoal com fontes

Ferramenta para pesquisar produtos e fornecedores, registrar cotações e simular resultados por pedido. Não executa vendas, pagamentos, pedidos nem fulfillment.

## Organização dos resultados

A análise usa abas **Fornecedores**, **Produtos** e **Vendas**, com navegação por teclado. Cada cartão resume uma fonte com preço selecionado, compra, venda simulada, lucro e status curto de vendas/reputação. Quando há vários valores, um seletor permite trocar o preço; inicialmente é mostrado o primeiro elegível encontrado, sem classificá-lo como menor preço ou melhor oferta. **Ver detalhes** abre contexto original, câmbio, cálculo completo, relatos, condições e cadastro. Os parâmetros ficam em **Ajustar custos e margem**, e observações técnicas/backup/pesquisa externa ficam recolhidos. A apresentação compacta preserva os dados e mantém o aviso de simulação visível.

## Análise completa de oportunidades

A opção inicial **Análise completa** faz três pesquisas basic: candidatos a fornecedor, produtos/preços no varejo e menções de mais vendidos/vendas. Lê até cinco URLs desses resultados usando Tavily Extract basic e pesquisa reputação externa para até três domínios de candidatos a fornecedor, no Reclame AQUI, Trustpilot e Mercado Livre. Consome até **sete créditos** por análise (3 buscas + até 1 crédito de extração + até 3 buscas de reputação). As opções simples continuam consumindo um crédito. Os relatos são pesquisados pelo domínio, sem presumir identidade ou nota verificada; fontes não consultadas são identificadas. Vídeos e redes sociais são excluídos das buscas. A operação pode levar até 90 segundos e informa falhas parciais.

### Moedas e preços

Identifica preços com moeda explícita BRL/R$, USD/US$, EUR/€, GBP/£ e CNY/RMB/CN¥. Preserva o preço original e o contexto. Converte moedas estrangeiras para reais usando a API pública Frankfurter, sem chave, com a taxa de referência e a data exibidas em cada oferta. Não infere a moeda pelo país do site e não converte símbolos ambíguos `$` ou `¥`. Sem taxa válida de até sete dias, não usa o valor no cálculo. Isso não representa o câmbio efetivo do cartão: spread, IOF e demais encargos devem ser informados em **Encargos de câmbio (%)**. Fontes: https://frankfurter.dev/ e https://api.frankfurter.dev/v2/rate/usd/brl.

Valores de pedido/compra mínima, “Min.”, kits/lotes, frete/desconto e parcelas/mensalidades detectados são excluídos do cálculo unitário. Por exemplo, “Pedido mínimo de R$ 700” não é custo de uma peça. A classificação é conservadora, baseada no contexto textual; não identifica SKU, variação, quantidade ou disponibilidade de modo garantido. Trechos sem unidade clara precisam ser confirmados. Guias/listas não recebem botão de cadastro de fornecedor. Uma página de varejo não vira um fornecedor aprovado.

### Simulação automática em cada preço

Todo preço elegível tem simulação automática de compra e revenda: custo em reais, preço de venda calculado, lucro por pedido, margem, custos totais e ROAS de equilíbrio. O preço de venda é calculado para a **meta de margem líquida** (inicialmente 30%, uma hipótese ajustável), não uma oferta observada no mercado. Não comparamos automaticamente produtos de SKU desconhecido ou presumimos que o mercado aceita a venda sugerida.

Informe os parâmetros compartilhados uma vez para recalcular todas as ofertas: frete, CPA, outros custos fixos, gateway/marketplace percentual e fixo, tributos sobre venda, tributos de importação por pedido, encargos de câmbio e meta de margem. Inicialmente os custos estão zerados e são explicitamente mostrados como ausentes; zero não significa isenção ou cotação real. Não há estimativa automática de impostos legais, frete para seu CEP ou CPA. Venda calculada = (compra em reais com encargos + custos fixos) / (1 − taxas percentuais − meta de margem). A mesma função financeira da calculadora calcula o resultado. Com taxas/meta inviáveis, o cenário não é exibido.

### Compras e reputação

Cada fonte mostra **Volume de compras: não verificado** e **Confiabilidade: não auditada**, junto às menções literais de vendas e aos relatos externos disponíveis. Contagens numa página podem ser de um produto, lista ou período diferente; não representam pedidos auditados da empresa. HTTPS, preço e presença em uma busca não demonstram entrega ou confiabilidade. Ausência de reclamações encontradas não comprova boa reputação. Não há selo inventado, ranking auditado, vendas mensais estimadas ou nota consolidada entre plataformas.

**Revisar e cadastrar fornecedor** preenche fonte e trechos. **Revisar e cadastrar este cenário** exige confirmação de produto/unidade/preço/disponibilidade e preenche compra e venda calculada, identificada como hipótese. A origem precisa ser escolhida antes de salvar. A fonte de custo e as hipóteses/câmbio ficam preservadas no produto e no backup. Custos além de compra/frete ficam documentados na descrição; a calculadora completa exige que sejam informados novamente. **Baixar análise com fontes** exporta também os parâmetros da simulação. O relatório não é salvo automaticamente no catálogo.

Integrações oficiais de catálogo/estoque/pedidos, identificação de SKU e reputação autenticada continuam necessárias para garantir indicadores comerciais por produto e fornecedor.

## Busca automática e reputação

A pesquisa usa **Tavily Search**, sem chamar Gemini ou Brave. Os resultados mostram títulos, URLs, trechos das páginas e data da consulta dentro do app. Uma consulta vazia é apresentada como vazia; erros nunca geram resultados fictícios. As fontes precisam ser verificadas antes de registrar preço, estoque, frete e condições comerciais. Um resultado encontrado não prova que a empresa oferece dropshipping.

Em **Reputação de fornecedor**, informe o nome exato da empresa. A consulta busca páginas do Reclame AQUI, Trustpilot e Mercado Livre e restringe os resultados a esses domínios. A interface mostra trechos de pesquisa, não uma nota certificada. Confira a identidade da empresa, o período e se a avaliação é do fornecedor ou de um produto. Sem páginas encontradas não significa ausência de reclamações. Não há integração autenticada com as APIs dessas plataformas, nem auditoria de fornecedores.

Cada clique de busca simples faz uma única chamada Tavily com `search_depth: basic`, `auto_parameters: false`, sem resposta gerada, conteúdo bruto ou retries, com timeout de 30 segundos. Segundo a documentação consultada em 30/09/2026, basic consome 1 crédito e o plano Researcher oferece 1.000 créditos mensais sem cartão. Outros usos da conta compartilham esses créditos; consulte o saldo no painel. O app não ativa faturamento ou planos pagos. Quando há limite, informa o erro. A análise completa consulta relatos de até três domínios; a busca simples não faz essa consulta adicional.

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
