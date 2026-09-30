import { Product, Supplier, ChecklistStage } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [];

// Official websites consulted on 2026-09-30. No inferred ratings, contacts or delivery promises.
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'official-printful', name: 'Printful', origin: 'internacional', category: 'Impressão sob demanda', location: 'Rede internacional; confirmar local de produção', dispatchTime: 'Consultar cotação do pedido', minOrder: 'Consultar catálogo e condições', whatsapp: '', catalogUrl: 'https://www.printful.com/', description: 'Produção e envio sob demanda. Custos de produto e frete devem ser cotados no catálogo oficial.', verifiedBadge: false, sourceUrl: 'https://www.printful.com/how-printful-works/on-demand-drop-shipping', sourceCheckedAt: '2026-09-30', verificationStatus: 'official-site' },
  { id: 'official-cj', name: 'CJdropshipping', origin: 'internacional', category: 'Produtos variados', location: 'Rede internacional; confirmar armazém do produto', dispatchTime: 'Consultar cotação do pedido', minOrder: 'Consultar catálogo e condições', whatsapp: '', catalogUrl: 'https://cjdropshipping.com/', description: 'Plataforma de sourcing e fulfillment para dropshipping. Disponibilidade, frete e condições para o Brasil exigem cotação.', verifiedBadge: false, sourceUrl: 'https://cjdropshipping.com/welcome.html', sourceCheckedAt: '2026-09-30', verificationStatus: 'official-site' },
];

export const INITIAL_CHECKLIST_STAGES: ChecklistStage[] = [
  {
    id: 1,
    title: '1. Validação do Produto & Nicho',
    subtitle: 'Garanta viabilidade financeira, demanda e diferenciação antes de gastar 1 centavo',
    tasks: [
      {
        id: 'chk-1-1',
        title: 'Verificar Margem Bruta Mínima de 65% a 70%',
        description: 'No dropshipping brasileiro, produtos com menos de R$ 40 de margem bruta tornam o tráfego pago insustentável.',
        completed: false,
        proTip: 'Dica de Ouro: Use a nossa Calculadora e confira se a margem líquida final supera 25% após todos os impostos e taxas.'
      },
      {
        id: 'chk-1-2',
        title: 'Análise de Saturação e Biblioteca de Anúncios da Meta',
        description: 'Pesquise o nome do produto na Meta Ad Library e no TikTok Creative Center para checar criativos ativos há mais de 15 dias.',
        completed: false,
        proTip: 'Se outros anunciantes estão rodando o mesmo anúncio há mais de 2 semanas contínuas, significa que o produto está vendendo com lucro!'
      },
      {
        id: 'chk-1-3',
        title: 'Identificar a Dor Central e Urgência do Público',
        description: 'Defina se o produto resolve uma dor imediata (ex: dor nas costas, segurança da casa, economia de tempo) ou apelo visual forte.',
        completed: false,
        proTip: 'Produtos que resolvem dores urgentes convertem até 3x mais no tráfego frio sem necessidade de remarketing pesado.'
      }
    ]
  },
  {
    id: 2,
    title: '2. Fornecedor & Logística Ágil',
    subtitle: 'Alinhe estoque, condições de despacho individual e conformidade fiscal',
    tasks: [
      {
        id: 'chk-2-1',
        title: 'Contato com o Fornecedor via WhatsApp',
        description: 'Envie a mensagem profissional de apresentação para confirmar se aceitam despacho unitário com etiqueta do lojista.',
        completed: false,
        proTip: 'Pergunte o horário de corte do despacho diário (geralmente pedidos aprovados até as 11h são postados no mesmo dia).'
      },
      {
        id: 'chk-2-2',
        title: 'Validar Rastreamento Válido e Envio dos Correios/Jadlog',
        description: 'Exija código de rastreio que atualize em até 24h a 48h úteis para evitar contestações no gateway de pagamento.',
        completed: false,
        proTip: 'Para fornecedores internacionais, garanta adesão ao programa Remessa Conforme com desembaraço aduaneiro antecipado.'
      },
      {
        id: 'chk-2-3',
        title: 'Comprar 1 Unidade Amostra de Teste',
        description: 'Faça um pedido de teste para sua própria residência para checar qualidade, embalagem e velocidade real de entrega.',
        completed: false,
        proTip: 'Grave o unboxing da sua amostra: esse material será seu melhor criativo autêntico (estilo UGC) para os anúncios!'
      }
    ]
  },
  {
    id: 3,
    title: '3. Loja & Infraestrutura de Conversão',
    subtitle: 'Configure páginas de alta conversão com checkout transparente e segurança',
    tasks: [
      {
        id: 'chk-3-1',
        title: 'Configurar Checkout Transparente (Mercado Pago, Appmax ou Yampi)',
        description: 'Redirecionamentos de checkout matam até 40% das conversões. Use checkout nativo com PIX instantâneo e 1 clique.',
        completed: false,
        proTip: 'No Brasil, mais de 65% das vendas em dropshipping são pagas via PIX. Ofereça 5% de desconto no PIX para aumentar a aprovação.'
      },
      {
        id: 'chk-3-2',
        title: 'Página de Produto Otimizada para Mobile',
        description: 'Certifique-se de que a página carregue em menos de 2.5 segundos no 4G, com botão de compra visível na primeira rolagem.',
        completed: false,
        proTip: 'Insira tabela de medidas claras se for calçado/vestuário e selo de "Garantia Incondicional de 7 Dias por Lei do CDC".'
      },
      {
        id: 'chk-3-3',
        title: 'Instalar Pixel da Meta e API de Conversões (CAPI)',
        description: 'Instale o Pixel com rastreamento de eventos: ViewContent, AddToCart, InitiateCheckout e Purchase com dados avançados.',
        completed: false,
        proTip: 'A API de conversões do servidor é obrigatória para driblar o bloqueio de cookies do iOS e manter a inteligência do algoritmo.'
      }
    ]
  },
  {
    id: 4,
    title: '4. Criativos & Estrutura Comercial',
    subtitle: 'Produza ganchos magnéticos e vídeos no formato 9:16 para Reels e TikTok',
    tasks: [
      {
        id: 'chk-4-1',
        title: 'Gerar Título e Copy Persuasiva no Gerador com IA',
        description: 'Utilize o nosso Módulo de IA para gerar o roteiro de 15 segundos e os gatilhos das 3 maiores dores resolvidas.',
        completed: false,
        proTip: 'Os primeiros 3 segundos do vídeo (Hook/Gancho) determinam 80% do sucesso do seu anúncio. Foque em quebra de padrão visual.'
      },
      {
        id: 'chk-4-2',
        title: 'Produzir pelo Menos 3 Variações de Criativos',
        description: 'Grave ou edite 3 ângulos diferentes: 1 focado na Dor, 1 focado no Antes vs. Depois e 1 no Unboxing/Demonstração.',
        completed: false,
        proTip: 'Use legendas dinâmicas grandes no centro da tela. 70% dos usuários assistem aos vídeos no feed com o som desligado!'
      },
      {
        id: 'chk-4-3',
        title: 'Adicionar Provas Sociais e Avaliações Reais',
        description: 'Insira fotos de clientes reais e depoimentos enfatizando a entrega rápida e a qualidade surpreendente do produto.',
        completed: false,
        proTip: 'Depoimentos que mencionam "Chegou em 4 dias em perfeito estado" anulam o maior medo do comprador brasileiro.'
      }
    ]
  },
  {
    id: 5,
    title: '5. Tráfego Pago & Teste de Escala',
    subtitle: 'Suba sua primeira campanha e valide o CPA com controle rígido de orçamento',
    tasks: [
      {
        id: 'chk-5-1',
        title: 'Campanha de Validação (CBO ou ABO com Orçamento Controlado)',
        description: 'Suba uma campanha no Meta Ads com 3 a 5 conjuntos de anúncios (público aberto + interesses amplos) e orçamento diário mínimo.',
        completed: false,
        proTip: 'Recomendação: Orçamento de R$ 30 a R$ 50/dia por conjunto durante 72 horas sem alterar o anúncio para a fase de aprendizado.'
      },
      {
        id: 'chk-5-2',
        title: 'Monitorar Métricas Chave (CTR > 1.8%, CPC < R$ 1.50)',
        description: 'Se o CTR no link estiver abaixo de 1.2%, troque o criativo. Se o CTR estiver bom mas não vende, o problema é a página de produto.',
        completed: false,
        proTip: 'Métrica de Corte: Se o conjunto gastar o valor do seu Lucro Líquido sem gerar nenhuma venda, pause o anúncio imediatamente.'
      },
      {
        id: 'chk-5-3',
        title: 'Escalar os Criativos Campeões e Ativar Remarketing',
        description: 'Ao encontrar um criativo com ROAS acima do break-even, suba o orçamento em 20% a cada 48h ou duplique em nova campanha CBO.',
        completed: false,
        proTip: 'Ative um anúncio simples de remarketing para quem abandonou o carrinho nos últimos 7 dias oferecendo frete grátis ou cupom de 5%.'
      }
    ]
  }
];
