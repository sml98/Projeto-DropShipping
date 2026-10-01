# DropRadar OS

Operação de dropshipping com prospecção, comparação nacional × internacional, curadoria, mídia real rastreável, loja e checkout. O sistema foi desenhado para vender com clareza: ele não inventa avaliações, escassez, lucro, autorização de mídia ou reputação de fornecedor.

## O que já funciona

- painel protegido por token e persistência SQLite no servidor;
- pesquisa pública de oportunidades com Tavily;
- geração de ofertas e criativos com Gemini e regras de venda ética;
- catálogo real da CJdropshipping: produtos, variantes, fotos, vídeos e cotação USD/BRL;
- cálculo de frete CJ para o Brasil e comparação por custo posto, prazo e risco;
- cadastro de fornecedores nacionais e suas evidências;
- score de oportunidade e bloqueios independentes de publicação;
- registro de URL, fonte, licença e data para cada foto ou vídeo;
- curadoria `descoberto → análise → aprovado → publicado`;
- vitrine pública em `/loja`, carrinho e prazo estimado sem revelar custos internos;
- checkout Mercado Pago, revalidação de oferta e webhook assinado;
- OAuth e publicação de produto na Nuvemshop;
- OAuth do TikTok preparado para app aprovado;
- pedidos persistidos, atualizados pelo pagamento e enviados à CJ após sua confirmação.

Dados demonstrativos só entram se você clicar em **Carregar dados de demonstração**. Eles nunca são tratados como fornecedores ou cotações reais.

## Executar agora

Requer Node.js 22.18 ou superior.

```bash
npm ci
npm run dev -- --hostname 127.0.0.1
```

- Painel: `http://127.0.0.1:3000`
- Loja: `http://127.0.0.1:3000/loja`

O arquivo `.env.local` local já contém tokens fortes gerados automaticamente e está ignorado pelo Git. Para copiar o token do painel sem mostrar as outras chaves:

```bash
sed -n 's/^APP_ACCESS_TOKEN=//p' .env.local
```

Cole esse valor uma única vez em **Integrações → Token pessoal do painel**. O navegador guarda a sessão e o servidor usa cookie `HttpOnly`.

## O mínimo que só você pode fazer

Contas, contratos, consentimentos e chaves externas pertencem a você; o software não pode criá-los em seu nome.

1. Crie suas contas e coloque as chaves em `.env.local`:
   - `TAVILY_API_KEY` para prospecção;
   - `GEMINI_API_KEY` para copy e roteiros;
   - `CJ_API_KEY` para catálogo e frete;
   - credencial de teste `MERCADO_PAGO_ACCESS_TOKEN`;
   - app Nuvemshop: `NUVEMSHOP_CLIENT_ID` e `NUVEMSHOP_CLIENT_SECRET`;
   - app TikTok: `TIKTOK_CLIENT_KEY` e `TIKTOK_CLIENT_SECRET`.
2. Informe seu e-mail em `APP_CONTACT_EMAIL` e a URL pública HTTPS em `STORE_BASE_URL`.
3. No Mercado Pago, cadastre o webhook `https://SEU-DOMINIO/api/webhooks/mercado-pago`, copie a assinatura secreta para `MERCADO_PAGO_WEBHOOK_SECRET` e mantenha `MERCADO_PAGO_ENVIRONMENT=test` até concluir um pedido de teste.
4. Na Nuvemshop, cadastre o callback do app exigido pelo portal e clique em **Autorizar Nuvemshop** no painel.
5. No TikTok, cadastre exatamente `https://SEU-DOMINIO/api/oauth/tiktok/callback`, solicite os escopos `user.info.basic`, `video.upload` e `video.publish`, verifique o domínio de mídia e clique em **Autorizar TikTok**.
6. Faça pedido-amostra, confirme nota fiscal, devolução e rastreio de cada fornecedor; depois registre as evidências no painel.
7. Confirme por contrato/licença o uso comercial das fotos e vídeos. “Público na internet” não significa “livre para reutilização”.

Reinicie o servidor após alterar `.env.local`.

## Fluxo recomendado

1. Conecte o painel com o token pessoal.
2. Em **Descoberta**, pesquise tendências e importe produtos reais da CJ.
3. Cadastre fornecedores nacionais e links de evidência.
4. Em **Revisar**, escolha variante, calcule o frete CJ, informe custos, estoque, prazo, demanda e licença da mídia.
5. Compare as ofertas. O motor considera custo posto, impostos configurados, reserva de devolução, CPA, margem, prazo e confiabilidade.
6. Aprove somente quando não houver bloqueios.
7. Gere a oferta e o roteiro. A estrutura aplicada é: situação concreta, demonstração, prova verificável, objeção real e CTA proporcional.
8. Publique na vitrine ou Nuvemshop e execute o checkout de teste.
9. Após o webhook aprovar o pagamento, clique em **Criar pedido CJ**. Em `CJ_ENVIRONMENT=test` a CJ recebe um pedido sandbox; em produção o sistema cria o pedido sem debitar seu saldo automaticamente.

## Regras de confiança

Um produto fica bloqueado se houver, entre outros motivos:

- mídia sem direito de uso confirmado;
- ausência de evidências de demanda;
- fornecedor não verificado;
- estoque desconhecido ou zerado;
- frete/prazo não calculado;
- margem ou lucro esperado insuficiente;
- preço e estoque sem revisão recente.

Fotos e vídeos importados da CJ são reais do produto, mas entram como **direito desconhecido** até você confirmar a autorização. O mesmo vale para mídia encontrada em páginas públicas.

## Implantação

Este projeto usa SQLite local. Em VPS/container, monte `./data` em volume persistente e rode uma única instância Node. Para múltiplas instâncias, migre as funções de `lib/server/db.ts` para PostgreSQL antes de escalar.

Em produção:

- use HTTPS;
- mantenha `.env.local` fora do Git e do pacote público;
- defina `MERCADO_PAGO_ENVIRONMENT=production` somente após o teste completo;
- defina `CJ_ENVIRONMENT=production` somente após conferir o pedido sandbox, endereço, variante e logística;
- configure backups do diretório `data`;
- aplique sua política de privacidade, troca, prazo e atendimento;
- não publique mídia sem prova de licença.

O TikTok exige app/escopo aprovados; clientes não auditados têm restrições de visibilidade, e mídia por URL precisa vir de domínio verificado. Por isso o sistema prepara e protege a conexão, mas não tenta publicar mídia de terceiros por atalhos.

## Verificação técnica

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

O checkout consulta preço, estoque, bloqueios e idade da cotação diretamente no servidor. O cliente nunca decide o preço final.
