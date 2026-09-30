import { Product, Supplier, ChecklistStage } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Liquidificador Portátil Turbo Fresh 6 Lâminas USB',
    category: 'Utilidades',
    niche: 'Casa & Cozinha',
    origin: 'nacional',
    originBadge: 'Estoque Brasil (3 a 6 dias)',
    deliveryTime: '3 a 6 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    supplierCost: 38.50,
    suggestedPrice: 129.90,
    estimatedFreight: 18.00,
    grossMargin: 70.36,
    supplierName: 'DropBrasil Distribuidora',
    supplierLocation: 'Armazém Campinas - SP',
    description: 'Mini liquidificador individual recarregável via USB com 6 lâminas de aço inoxidável. Bateria de 2000mAh com autonomia para até 12 vitaminas. Ideal para academia e escritório.',
    painPoints: [
      'Dificuldade de manter dieta saudável fora de casa na correria do dia a dia',
      'Preguiça de sujar liquidificadores convencionais grandes e pesados',
      'Gasto excessivo com sucos e shakes caros em lanchonetes e academias'
    ],
    trendingScore: 96,
    salesVolumeEstimate: '+3.400 vendas/mês'
  },
  {
    id: 'prod-2',
    name: 'Tênis Ortopédico CloudWalk Respirável Masculino/Feminino',
    category: 'Moda & Calçados',
    niche: 'Calçados & Conforto',
    origin: 'nacional',
    originBadge: 'Estoque Brasil (3 a 6 dias)',
    deliveryTime: '2 a 5 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    supplierCost: 49.90,
    suggestedPrice: 169.90,
    estimatedFreight: 19.50,
    grossMargin: 70.63,
    supplierName: 'Polo Calçadista Franca Express',
    supplierLocation: 'Franca - SP',
    description: 'Tênis com amortecimento em espuma memória, cabedal em malha knit respirável e solado antiderrapante com absorção de impacto. Excelente para caminhadas, trabalho em pé e alívio de esporão.',
    painPoints: [
      'Dores crônicas nos pés, joelhos e lombar após passar o dia todo trabalhando em pé',
      'Tênis convencionais apertados que provocam calos e transpiração excessiva',
      'Calçados ortopédicos tradicionais com design feio e visual ultrapassado'
    ],
    trendingScore: 94,
    salesVolumeEstimate: '+5.100 vendas/mês'
  },
  {
    id: 'prod-3',
    name: 'Kit Câmera de Segurança Smart WiFi 360° com Visão Noturna',
    category: 'Eletrônicos',
    niche: 'Segurança & Smart Home',
    origin: 'nacional',
    originBadge: 'Estoque Brasil (3 a 6 dias)',
    deliveryTime: '3 a 6 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=600&auto=format&fit=crop&q=80',
    supplierCost: 54.00,
    suggestedPrice: 189.90,
    estimatedFreight: 21.00,
    grossMargin: 71.56,
    supplierName: 'Eletrônicos MegaBrás Hub',
    supplierLocation: 'Brás - São Paulo, SP',
    description: 'Câmera IP robô conectada via aplicativo celular (iOS e Android), rotação 360°, sensor de movimento com alerta sonoro, microfone bidirecional e visão noturna infravermelha HD 1080p.',
    painPoints: [
      'Insegurança ao deixar casa vazia durante viagens ou períodos de trabalho',
      'Preocupação com pets, crianças ou idosos sozinhos em casa sem monitoramento',
      'Custo absurdo de contratação e instalação de empresas de segurança privada'
    ],
    trendingScore: 91,
    salesVolumeEstimate: '+2.800 vendas/mês'
  },
  {
    id: 'prod-4',
    name: 'Relógio Smartwatch Ultra 9 Série Titanium NFC com Pulseiras',
    category: 'Eletrônicos',
    niche: 'Smartwatches & Gadgets',
    origin: 'internacional',
    originBadge: 'Importação Exclusiva (10 a 15 dias)',
    deliveryTime: '10 a 15 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    supplierCost: 65.00,
    suggestedPrice: 247.00,
    estimatedFreight: 15.00,
    grossMargin: 73.68,
    supplierName: 'CJ Shenzhen Global Logistics',
    supplierLocation: 'Shenzhen - China',
    description: 'Smartwatch tela infinita AMOLED 2.1 polegadas, caixa de liga titânio aeroespacial, monitoramento cardíaco, pressão, sono, 100+ modos esportivos, chamada bluetooth e suporte Remessa Conforme com desembaraço expresso.',
    painPoints: [
      'Desejo do visual e status dos smartwatches topo de linha de R$ 5.000 a um preço acessível',
      'Falta de controle de hábitos saudáveis, passos diários e monitoramento cardíaco',
      'Perder notificações importantes e chamadas no trânsito ou durante reuniões'
    ],
    trendingScore: 98,
    salesVolumeEstimate: '+8.900 vendas/mês'
  },
  {
    id: 'prod-5',
    name: 'Organizador Giratório 360° Acrílico Diamante para Cosméticos',
    category: 'Casa',
    niche: 'Organização & Beleza',
    origin: 'internacional',
    originBadge: 'Importação Exclusiva (10 a 15 dias)',
    deliveryTime: '10 a 14 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
    supplierCost: 28.90,
    suggestedPrice: 119.90,
    estimatedFreight: 14.00,
    grossMargin: 75.90,
    supplierName: 'Yiwu Direct Dropship Partner',
    supplierLocation: 'Yiwu / Cantão - China',
    description: 'Suporte de acrílico cristal reforçado giratório em 360 graus com 7 bandejas reguláveis. Capacidade para até 30 pincéis e 20 frascos de maquiagem e perfumes. Muito viral no TikTok e Reels.',
    painPoints: [
      'Penteadeira ou bancada do banheiro sempre bagunçada com maquiagens espalhadas',
      'Perder tempo procurando o batom ou base certa antes de sair atrasada',
      'Danos e quebras em produtos caros de skincare por falta de apoio seguro'
    ],
    trendingScore: 89,
    salesVolumeEstimate: '+4.200 vendas/mês'
  },
  {
    id: 'prod-6',
    name: 'Aspirador Automático Robot Smart Slim Varredura e Passa Pano',
    category: 'Utilidades',
    niche: 'Smart Home & Limpeza',
    origin: 'internacional',
    originBadge: 'Importação Exclusiva (10 a 15 dias)',
    deliveryTime: '11 a 16 dias úteis',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    supplierCost: 82.00,
    suggestedPrice: 289.00,
    estimatedFreight: 22.00,
    grossMargin: 71.63,
    supplierName: 'Zhengzhou Tech Supply Co.',
    supplierLocation: 'Zhengzhou - China',
    description: 'Robô aspirador ultrafino com sensor anticolisão e antiqueda, sistema duplo de escovas rotativas e suporte com pano de microfibra umedecido. Bateria de lítio de 1200mAh com recarga USB.',
    painPoints: [
      'Cansaço extremo e perda de horas preciosas do final de semana limpando a casa',
      'Pelos de animais e poeira acumulando diariamente debaixo de camas e sofás',
      'Robôs de marcas tradicionais custando mais de R$ 1.500 no varejo nacional'
    ],
    trendingScore: 92,
    salesVolumeEstimate: '+3.100 vendas/mês'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'DropBrasil Distribuidora',
    tradeName: 'DropBrasil Logística Integrada Ltda',
    origin: 'nacional',
    category: 'Utilidades & Cozinha',
    location: 'Campinas - SP (Polo Logístico Viracopos)',
    dispatchTime: '24h a 48h',
    rating: 4.9,
    reviewsCount: 312,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5511998765432',
    catalogUrl: 'https://fornecedoresbr.com/dropbrasil',
    description: 'Especialista em produtos domésticos, pequenos eletroportáteis e novidades em utilidades. Emite nota fiscal com sua chave de acesso e despacho direto pelos Correios/Jadlog no mesmo dia.',
    verifiedBadge: true
  },
  {
    id: 'sup-2',
    name: 'Polo Calçadista Franca Express',
    tradeName: 'Franca Shoes Dropshipping',
    origin: 'nacional',
    category: 'Calçados & Moda',
    location: 'Franca - SP',
    dispatchTime: '24h a 48h',
    rating: 4.8,
    reviewsCount: 189,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5516997654321',
    catalogUrl: 'https://fornecedoresbr.com/franca-shoes',
    description: 'Fábrica e distribuidora direta de Franca-SP de calçados ortopédicos, botas em couro legítimo e tênis casuais knit. Embalagem neutra com etiqueta do remetente personalizada.',
    verifiedBadge: true
  },
  {
    id: 'sup-3',
    name: 'Eletrônicos MegaBrás Hub',
    tradeName: 'MegaBrás Import & Distribuição',
    origin: 'nacional',
    category: 'Eletrônicos & Smart Home',
    location: 'Brás - São Paulo, SP',
    dispatchTime: '24h a 48h',
    rating: 4.7,
    reviewsCount: 245,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5511987654320',
    catalogUrl: 'https://fornecedoresbr.com/megabras-hub',
    description: 'Armazém a pronta entrega localizado no Brás com fones bluetooth, câmeras inteligentes, caixas de som e luminárias LED. Teste funcional de 100% dos produtos antes do envio.',
    verifiedBadge: true
  },
  {
    id: 'sup-4',
    name: 'CJ Shenzhen Global Logistics',
    tradeName: 'CJ Dropshipping Shenzhen Branch',
    origin: 'internacional',
    category: 'Eletrônicos & Gadgets',
    location: 'Shenzhen - China (Linha Expresso Brasil)',
    dispatchTime: '7 a 12 dias',
    rating: 4.9,
    reviewsCount: 840,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5511912345678',
    catalogUrl: 'https://cjdropshipping.com',
    description: 'Agente internacional oficial com integração Remessa Conforme homologada. Linha especial Yanwen/YunExpress com entrega no Brasil entre 10 e 15 dias sem risco de retenção na alfândega.',
    verifiedBadge: true
  },
  {
    id: 'sup-5',
    name: 'Yiwu Direct Dropship Partner',
    tradeName: 'Yiwu Commodities Export Co.',
    origin: 'internacional',
    category: 'Casa, Decoração & Beleza',
    location: 'Yiwu / Cantão - China',
    dispatchTime: '7 a 12 dias',
    rating: 4.6,
    reviewsCount: 420,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5511976543219',
    catalogUrl: 'https://yiwugo.com',
    description: 'Acesso direto ao maior mercado atacadista do mundo (Yiwu Market). Curadoria de produtos virais de beleza, organizadores e novidades de decoração com fotos e vídeos sem marca d’água.',
    verifiedBadge: true
  },
  {
    id: 'sup-6',
    name: 'Nova Serrana Sport Shoes Hub',
    tradeName: 'NS Calçados Desportivos MG',
    origin: 'nacional',
    category: 'Calçados & Esportes',
    location: 'Nova Serrana - MG',
    dispatchTime: '24h a 48h',
    rating: 4.7,
    reviewsCount: 164,
    minOrder: 'Sem pedido mínimo (Drop Unitário)',
    whatsapp: '5537998123456',
    catalogUrl: 'https://fornecedoresbr.com/ns-calcados',
    description: 'Capital do calçado esportivo em Minas Gerais. Fornecimento direto de tênis esportivos masculinos e femininos com grade completa do 34 ao 44 a pronta entrega.',
    verifiedBadge: true
  }
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
