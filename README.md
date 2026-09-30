# DropRadar BR — pesquisa pessoal com fontes

Ferramenta para pesquisar produtos e fornecedores, registrar cotações e simular resultados por pedido. Não executa vendas, pagamentos, pedidos nem fulfillment.

## O que é real e o que é uma hipótese

- **Busca web:** utiliza exclusivamente `gemini-3.5-flash-lite` com a ferramenta Google Search, usando a mesma `GEMINI_API_KEY` do gerador. Exibe somente os títulos e URLs de `groundingMetadata.groundingChunks`, junto com a data da consulta. Exige também consultas em `webSearchQueries` para aceitar uma pesquisa. O texto gerado pelo modelo não vira catálogo, preço ou avaliação. Sem pesquisa com fontes válidas, retorna erro. Os links podem redirecionar pelo Google. Confirme preço, estoque, frete e contrato na página original.
- **Pesquisa direta:** prepara links para Google, DuckDuckGo e Mercado Livre sem chamar APIs, exigir chave ou token. Continua disponível quando a busca automática falha.
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

Configure `.env.local` apenas na primeira instalação:

```dotenv
APP_ACCESS_TOKEN=seu_token_pessoal_com_pelo_menos_24_caracteres
GEMINI_API_KEY=sua_chave_gemini
```

A chave já configurada em `GEMINI_API_KEY` é reutilizada. Não é necessário cadastrar outra API nem trocar a chave. Brave e Tavily não são chamadas. As variáveis antigas `BRAVE_SEARCH_API_KEY`, `TAVILY_API_KEY` e `GEMINI_MODEL` são ignoradas; busca e gerador chamam somente `gemini-3.5-flash-lite`. A seleção fixa impede que uma configuração antiga direcione chamadas a outro modelo.

O token protege o consumo da sua chave e fica no sessionStorage da aba. Se ainda não houver token, gere com `openssl rand -hex 32` e configure `APP_ACCESS_TOKEN` no servidor. Não publique `.env.local` nem envie a chave no chat. A chave fica somente no servidor.

```bash
npm run dev
```

Abra http://localhost:3000. Em **Acesso às APIs opcionais**, informe apenas o token pessoal, não a chave Gemini. A opção **Buscar com Gemini 3.5 Flash-Lite + Google Search** vem ativada. Digite o produto ou fornecedor e clique em **Buscar com Gemini**. As fontes e a data aparecerão após a consulta. O widget de sugestões de pesquisa fornecido pelo Google é exibido em um iframe isolado sem execução de scripts e sem acesso ao armazenamento do app.

Confira os dados comerciais na página original antes de registrar uma cotação em **+ Produto** ou **+ Fornecedor**. O app não mede vendas ou demanda nem confirma que um fornecedor é confiável. Obter catálogos, estoques e cotações oficiais por APIs dos fornecedores continua pendente.

Para usar o app sem credenciais, desmarque a busca Gemini e escolha **Preparar pesquisa gratuita**. Catálogo, calculadora, checklist e backups continuam disponíveis.

### Quotas e falhas

A tabela oficial consultada em 30/09/2026 informa Google Search para `gemini-3.5-flash-lite` no plano pago, com 5.000 requisições de busca gratuitas por mês compartilhadas entre modelos Gemini 3.x elegíveis; após a franquia, há cobrança de buscas. Os tokens de entrada e saída são cobrados no plano pago mesmo dentro da franquia de busca. Essa franquia não equivale a 5.000 chamadas completas gratuitas. Confira https://ai.google.dev/gemini-api/docs/pricing e o plano/quota do seu projeto no AI Studio.

A configuração usa um modelo atual; o 2.5 Flash está restrito a usuários anteriores e pode retornar 404 em novos projetos. O app reutiliza a chave cadastrada e não ativa faturamento, não compra créditos nem muda o plano Google. Em um projeto Free, a busca Google Search pode ser recusada; configure o plano no AI Studio somente se aceitar os custos correspondentes. A franquia é compartilhada com outros usos do projeto: o aplicativo não conhece nem impõe seu saldo global.

Cada clique faz uma única chamada `generateContent`, sem retries ou outro provedor/modelo, com timeout de 30 segundos. Usa `thinkingLevel: MINIMAL`, sem o parâmetro `thinkingBudget` do modelo anterior, e limite de saída. O Google pode executar várias buscas internas em uma chamada; elas contam para a franquia de pesquisa. Quota esgotada retorna HTTP 429; falta de chave, erro do provedor e falta de fontes são informados sem simular sucesso. Os links de pesquisa direta permanecem disponíveis.

Nenhuma chave Gemini está disponível no ambiente de desenvolvimento desta atualização. A chamada autenticada real precisa ser confirmada no seu Termux, que já contém a chave; os testes de integração usam fixtures explícitas e não alimentam o catálogo.

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

## Diagnosticar falhas Gemini no Termux

Após salvar `.env.local`, reinicie o servidor. Se ainda falhar, a interface mostra a categoria, o status HTTP do Google e o detalhe da resposta com chave/token removidos. Uma mensagem genérica anterior não prova que a chave é inválida.

```bash
npm run diagnose:gemini
```

O comando usa o executor TypeScript `tsx`, instalado por `npm ci`, para não depender do suporte nativo do Node a arquivos `.ts`. Se surgir `ERR_UNKNOWN_FILE_EXTENSION`, atualize o repositório e reinstale as dependências antes de repetir o comando.

Esse comando carrega `.env.local` e faz uma única consulta real ao `gemini-3.5-flash-lite` com Google Search, consumindo uma chamada da sua quota. Não exige o token do navegador. Em caso de sucesso, imprime o número de fontes; em caso de falha, imprime o diagnóstico sem mostrar a chave/token. Não imprime `.env.local` nem resposta bruta do SDK. Não testa outros modelos, não contrata plano e não repete a chamada. Compartilhe somente o diagnóstico, nunca uma captura do arquivo de credenciais.

## Segurança e limites do uso pessoal

As rotas de pesquisa Gemini e geração de anúncios exigem token com no mínimo 24 caracteres e comparação em tempo constante. Cada função mantém limite de corpo de 8 KB, validação de campos, timeout externo e até 30 chamadas por hora/processo. O limite reinicia quando o processo reinicia e não é compartilhado entre instâncias. No modo direto, a rota de pesquisa apenas prepara links validados, com corpo limitado a 8 KB e termo de até 200 caracteres; não chama serviços externos nem usa credenciais. Para uso público/multiusuário, substitua o acesso à IA por autenticação individual e quotas compartilhadas. Quem possui o token pode consumir sua quota; não compartilhe o token pessoal.

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

Os testes cobrem taxas zeradas, tributos cotados, custos operacionais, ausência de equilíbrio, margem positiva estreita, URLs de pesquisa e validação de backup. O teste de produção verifica que a pesquisa prepara links sem token, inclusive quando existe um token configurado para IA, além de validar limites e proteção do gerador. A integração Gemini Search foi validada com fixtures para modelo fixo, ferramenta Google Search, ausência de retries e rejeição de respostas sem grounding. Nunca usa fixtures em produção. Chamadas reais ao Gemini dependem das suas credenciais e não foram testadas.

## Fontes técnicas e comerciais

- Pesquisa direta: https://www.google.com/ , https://duckduckgo.com/ e https://www.mercadolivre.com.br/
- Gemini: https://ai.google.dev/gemini-api/docs/models
- Google Search grounding: https://ai.google.dev/gemini-api/docs/generate-content/google-search
- Preços/quotas: https://ai.google.dev/gemini-api/docs/pricing
- Printful: https://www.printful.com/how-printful-works/on-demand-drop-shipping
- CJdropshipping: https://cjdropshipping.com/welcome.html

## Próximas integrações

Conectar catálogos/cotações de fornecedores por APIs oficiais com credenciais da sua conta; persistência em banco com acesso pessoal; comparação histórica de preços; verificação de CNPJ para empresas brasileiras quando houver identificação fornecida. A busca web atual não substitui esses recursos nem representa tendência de vendas.

O repositório original não contém licença. Esta atualização não atribui uma licença ao código de terceiros.
