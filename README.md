# DropRadar BR — pesquisa pessoal com fontes

Ferramenta para pesquisar produtos e fornecedores, registrar cotações e simular resultados por pedido. Não executa vendas, pagamentos, pedidos nem fulfillment.

## O que é real e o que é uma hipótese

- **Busca web:** `POST /api/pesquisar` consulta a API Brave Search e devolve os títulos, URLs e trechos efetivamente retornados, junto com o horário da consulta. Não usa geração de IA para inventar resultados. Um trecho pode estar desatualizado: preço, estoque e contrato devem ser confirmados na página original.
- **Fornecedores iniciais:** Printful e CJdropshipping, com links dos próprios sites consultados em 30/09/2026. Isso documenta a existência e a oferta anunciada, não uma auditoria de qualidade, contrato, disponibilidade no Brasil ou certificação. Não há WhatsApps, notas ou avaliações presumidas.
- **Produtos:** catálogo inicialmente vazio. Cadastre um produto após pesquisa e cotação, informando sua URL de origem. Custo, frete, preço de venda e CPA são valores informados pelo usuário; não são métricas obtidas automaticamente de marketplaces.
- **Calculadora:** não presume alíquotas legais, regime tributário ou adesão ao Remessa Conforme. Informe o total de tributos da cotação atual e evite duplicar impostos já incluídos no custo. As taxas inicialmente zeradas não significam isenção. Inclua custos de operação e devoluções no campo de outros custos por pedido.
- **IA:** cria apenas um rascunho comercial baseado nas características informadas. Não mede demanda nem confirma características; revise a saída. Sem chave, retorna erro de configuração, nunca uma resposta fictícia.

## Executar localmente

Requer Node.js >= 22.18.0 e npm.

```bash
npm ci
cp .env.example .env.local
openssl rand -hex 32
```

Configure `.env.local`:

```dotenv
APP_ACCESS_TOKEN=cole_o_token_aleatorio_gerado_acima
BRAVE_SEARCH_API_KEY=sua_chave_da_api_brave
GEMINI_API_KEY=sua_chave_gemini_opcional
GEMINI_MODEL=gemini-3.8-flash
```

**A Brave Search API é paga.** A busca automática exige uma conta com plano contratado e uma chave obtida em https://api-dashboard.search.brave.com/ . Não há gratuidade presumida nesta aplicação. Confira preços, cobrança por consulta e limites no painel antes de configurar a chave. Os links de pesquisa direta funcionam sem chave Brave e não consomem essa API. A chave Gemini pode ser obtida em https://aistudio.google.com/ . O modelo é configurável; disponibilidade e quota dependem da sua conta. Nenhuma chave é incluída no repositório ou enviada ao navegador.

```bash
npm run dev
```

Abra http://localhost:3000 . Em **Pesquisa → Acesso pessoal às APIs**, informe somente `APP_ACCESS_TOKEN` (não as chaves dos provedores). O token é mantido no sessionStorage da aba. Reinicie o servidor após alterar variáveis.

Sem credenciais configuradas, os links de pesquisa direta e os cadastros/calculadora continuam disponíveis. A busca automática e a IA indicam que estão indisponíveis; não simulam sucesso.

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

As rotas pagas exigem token com no mínimo 24 caracteres, comparação em tempo constante, limite de corpo de 8 KB, validação de campos, timeout externo e até 30 chamadas por hora por função/processo. O limite reinicia quando o processo reinicia e não é compartilhado entre instâncias. Para uso público/multiusuário, substitua por autenticação individual, quotas compartilhadas e limites na infraestrutura. Sirva por HTTPS. Quem possui o token pode consumir sua quota; não compartilhe o token pessoal.

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

Os testes cobrem taxas zeradas, tributos cotados, custos operacionais, ausência de equilíbrio, margem positiva estreita, URLs de pesquisa e validação de backup. Integração ao vivo com Brave/Gemini exige suas credenciais e não é comprovada pelos testes unitários.

## Fontes técnicas e comerciais

- Brave Web Search: https://api-dashboard.search.brave.com/api-reference/web/search/get
- Gemini: https://ai.google.dev/gemini-api/docs/models
- Printful: https://www.printful.com/how-printful-works/on-demand-drop-shipping
- CJdropshipping: https://cjdropshipping.com/welcome.html

## Próximas integrações

Conectar catálogos/cotações de fornecedores por APIs oficiais com credenciais da sua conta; persistência em banco com acesso pessoal; comparação histórica de preços; verificação de CNPJ para empresas brasileiras quando houver identificação fornecida. A busca web atual não substitui esses recursos nem representa tendência de vendas.

O repositório original não contém licença. Esta atualização não atribui uma licença ao código de terceiros.
