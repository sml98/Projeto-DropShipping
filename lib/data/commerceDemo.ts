import type { CommerceProduct, CommerceSupplier, CreativeDraft } from '../commerce-types';

// Demonstration records exercise the complete workflow. They are not live quotes and
// are deliberately labeled as examples in the UI. Replace them through real connectors.
export const DEMO_SUPPLIERS: CommerceSupplier[] = [
  {
    id: 'sup-br-demo', name: 'Fornecedor Nacional — demonstração', origin: 'national', country: 'Brasil', integration: 'feed',
    verification: 'sample-tested', invoiceConfirmed: true, returnsConfirmed: true, trackingConfirmed: true,
    sampleOrderAt: '2026-09-18',
    evidence: [{ label: 'Registro demonstrativo — substitua pelo contrato real', url: 'https://example.com/fornecedor-nacional', checkedAt: '2026-09-30' }],
  },
  {
    id: 'sup-br-manual', name: 'Distribuidor BR — demonstração', origin: 'national', country: 'Brasil', integration: 'manual',
    verification: 'documented', invoiceConfirmed: true, returnsConfirmed: false, trackingConfirmed: true,
    evidence: [{ label: 'Cadastro demonstrativo', url: 'https://example.com/distribuidor-br', checkedAt: '2026-09-30' }],
  },
  {
    id: 'sup-cj', name: 'CJdropshipping', origin: 'international', country: 'China / Global', integration: 'api',
    verification: 'documented', invoiceConfirmed: false, returnsConfirmed: true, trackingConfirmed: true,
    evidence: [{ label: 'Site e documentação oficial', url: 'https://developers.cjdropshipping.com/en/api/start/Products-Synchronization-Processing.html', checkedAt: '2026-09-30' }],
  },
  {
    id: 'sup-printful', name: 'Printful', origin: 'international', country: 'Rede internacional', integration: 'api',
    verification: 'documented', invoiceConfirmed: false, returnsConfirmed: true, trackingConfirmed: true,
    evidence: [{ label: 'Documentação oficial', url: 'https://developers.printful.com/docs/', checkedAt: '2026-09-30' }],
  },
];

export const DEMO_PRODUCTS: CommerceProduct[] = [
  {
    id: 'prod-bottle', slug: 'garrafa-termica-portatil', name: 'Garrafa térmica portátil', category: 'Casa & rotina',
    summary: 'Produto demonstrativo com forte apelo de uso diário e conteúdo visual simples.',
    utility: 'Ajuda a manter bebidas na temperatura durante deslocamentos e rotina de trabalho.',
    tags: ['utilidade', 'rotina', 'presente'],
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
    imageSourceUrl: 'https://unsplash.com/', mediaRights: 'licensed', targetPrice: 119.9, estimatedCpa: 23, taxPercent: 6,
    demand: { searchMomentum: 72, socialMomentum: 67, reviewQuality: 4.5, reviewCount: 842, evidenceCount: 3, note: 'Sinais demonstrativos; conecte fontes reais antes de publicar.' },
    status: 'published', selectedOfferId: 'offer-bottle-br', publishedAt: '2026-09-30T12:00:00.000Z',
    offers: [
      { id: 'offer-bottle-br', supplierId: 'sup-br-demo', sku: 'BR-GAR-500', variant: '500 ml', unitCost: 38, freight: 12, importCharges: 0, exchangeCharges: 0, paymentFees: 4.2, otherCosts: 3, currency: 'BRL', stock: 184, minOrder: 1, deliveryMinDays: 2, deliveryMaxDays: 6, returnRiskPercent: 3, sourceUrl: 'https://example.com/fornecedor-nacional/garrafa', checkedAt: '2026-09-30', apiSynced: false },
      { id: 'offer-bottle-cj', supplierId: 'sup-cj', sku: 'CJ-GAR-500', variant: '500 ml', unitCost: 19.5, freight: 22, importCharges: 14, exchangeCharges: 2.4, paymentFees: 3.8, otherCosts: 2, currency: 'BRL', stock: 1200, minOrder: 1, deliveryMinDays: 10, deliveryMaxDays: 22, returnRiskPercent: 6, sourceUrl: 'https://cjdropshipping.com/', checkedAt: '2026-09-30', apiSynced: false },
    ],
  },
  {
    id: 'prod-stand', slug: 'suporte-magnetico-celular', name: 'Suporte magnético articulado', category: 'Acessórios',
    summary: 'Acessório compacto para mesa, carro ou gravação de conteúdo.', utility: 'Mantém o celular estável e libera as mãos.',
    tags: ['demonstração visual', 'baixo ticket', 'mobile'],
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', imageSourceUrl: 'https://unsplash.com/', mediaRights: 'licensed',
    targetPrice: 79.9, estimatedCpa: 18, taxPercent: 6,
    demand: { searchMomentum: 81, socialMomentum: 84, reviewQuality: 4.3, reviewCount: 1260, evidenceCount: 4, note: 'Exemplo de sinal; requer validação por fonte e período.' },
    status: 'review', offers: [
      { id: 'offer-stand-br', supplierId: 'sup-br-manual', sku: 'BR-SUP-MAG', variant: 'Universal', unitCost: 27, freight: 10, importCharges: 0, exchangeCharges: 0, paymentFees: 3, otherCosts: 2, currency: 'BRL', stock: 63, minOrder: 1, deliveryMinDays: 3, deliveryMaxDays: 8, returnRiskPercent: 4, sourceUrl: 'https://example.com/distribuidor-br/suporte', checkedAt: '2026-09-30', apiSynced: false },
      { id: 'offer-stand-cj', supplierId: 'sup-cj', sku: 'CJ-SUP-MAG', variant: 'Universal', unitCost: 9.8, freight: 14, importCharges: 8, exchangeCharges: 1.2, paymentFees: 2.6, otherCosts: 2, currency: 'BRL', stock: 860, minOrder: 1, deliveryMinDays: 9, deliveryMaxDays: 18, returnRiskPercent: 6, sourceUrl: 'https://cjdropshipping.com/', checkedAt: '2026-09-30', apiSynced: false },
    ],
  },
  {
    id: 'prod-watch', slug: 'relogio-inteligente-basico', name: 'Relógio inteligente básico', category: 'Eletrônicos',
    summary: 'Produto demonstrativo de ticket médio, com maior risco de suporte e devolução.', utility: 'Centraliza notificações e indicadores cotidianos no pulso.',
    tags: ['eletrônico', 'presente', 'comparativo'],
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=80', imageSourceUrl: 'https://unsplash.com/', mediaRights: 'licensed', targetPrice: 189.9, estimatedCpa: 38, taxPercent: 6,
    demand: { searchMomentum: 64, socialMomentum: 59, reviewQuality: 4.1, reviewCount: 430, evidenceCount: 2, note: 'Categoria competitiva; qualidade da variante deve ser testada.' },
    status: 'discovered', offers: [
      { id: 'offer-watch-br', supplierId: 'sup-br-manual', sku: 'BR-WATCH-01', variant: 'Preto', unitCost: 96, freight: 13, importCharges: 0, exchangeCharges: 0, paymentFees: 7, otherCosts: 4, currency: 'BRL', stock: 18, minOrder: 1, deliveryMinDays: 3, deliveryMaxDays: 8, returnRiskPercent: 9, sourceUrl: 'https://example.com/distribuidor-br/relogio', checkedAt: '2026-09-30', apiSynced: false },
      { id: 'offer-watch-cj', supplierId: 'sup-cj', sku: 'CJ-WATCH-01', variant: 'Preto', unitCost: 52, freight: 19, importCharges: 24, exchangeCharges: 4, paymentFees: 6, otherCosts: 3, currency: 'BRL', stock: 420, minOrder: 1, deliveryMinDays: 11, deliveryMaxDays: 24, returnRiskPercent: 12, sourceUrl: 'https://cjdropshipping.com/', checkedAt: '2026-09-30', apiSynced: false },
    ],
  },
  {
    id: 'prod-organizer', slug: 'organizador-modular-mesa', name: 'Organizador modular de mesa', category: 'Organização',
    summary: 'Solução visual de organização para escritório e estudo.', utility: 'Reduz a desorganização de itens pequenos em mesas e bancadas.',
    tags: ['antes e depois', 'organização', 'baixo risco'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', imageSourceUrl: 'https://unsplash.com/', mediaRights: 'licensed', targetPrice: 99.9, estimatedCpa: 21, taxPercent: 6,
    demand: { searchMomentum: 69, socialMomentum: 78, reviewQuality: 4.6, reviewCount: 650, evidenceCount: 3, note: 'Demonstração; validar tamanho, material e frete volumétrico.' },
    status: 'approved', selectedOfferId: 'offer-org-br', offers: [
      { id: 'offer-org-br', supplierId: 'sup-br-demo', sku: 'BR-ORG-04', variant: '4 módulos', unitCost: 31, freight: 15, importCharges: 0, exchangeCharges: 0, paymentFees: 3.7, otherCosts: 3, currency: 'BRL', stock: 92, minOrder: 1, deliveryMinDays: 2, deliveryMaxDays: 7, returnRiskPercent: 3, sourceUrl: 'https://example.com/fornecedor-nacional/organizador', checkedAt: '2026-09-30', apiSynced: false },
      { id: 'offer-org-cj', supplierId: 'sup-cj', sku: 'CJ-ORG-04', variant: '4 módulos', unitCost: 16, freight: 27, importCharges: 12, exchangeCharges: 2, paymentFees: 3.1, otherCosts: 2, currency: 'BRL', stock: 740, minOrder: 1, deliveryMinDays: 11, deliveryMaxDays: 25, returnRiskPercent: 5, sourceUrl: 'https://cjdropshipping.com/', checkedAt: '2026-09-30', apiSynced: false },
    ],
  },
  {
    id: 'prod-bag', slug: 'ecobag-personalizada', name: 'Ecobag personalizada sob demanda', category: 'Moda & presente',
    summary: 'Produto sob demanda para criar coleções próprias sem estoque inicial.', utility: 'Sacola reutilizável com estampa autoral e produção após a venda.',
    tags: ['marca própria', 'presente', 'sob demanda'],
    imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=1200&q=80', imageSourceUrl: 'https://unsplash.com/', mediaRights: 'licensed', targetPrice: 89.9, estimatedCpa: 20, taxPercent: 6,
    demand: { searchMomentum: 56, socialMomentum: 65, reviewQuality: 4.4, reviewCount: 110, evidenceCount: 2, note: 'Potencial depende do design e da marca, não apenas do produto-base.' },
    status: 'review', offers: [
      { id: 'offer-bag-printful', supplierId: 'sup-printful', sku: 'PF-TOTE-DEMO', variant: 'Natural', unitCost: 42, freight: 18, importCharges: 0, exchangeCharges: 3, paymentFees: 3.5, otherCosts: 2, currency: 'BRL', stock: null, minOrder: 1, deliveryMinDays: 7, deliveryMaxDays: 15, returnRiskPercent: 4, sourceUrl: 'https://www.printful.com/custom/tote-bags', checkedAt: '2026-09-30', apiSynced: false },
    ],
  },
];

export const DEMO_CREATIVES: CreativeDraft[] = [
  { id: 'creative-1', productId: 'prod-bottle', format: 'reel', hook: 'Sua bebida perde a temperatura antes do meio-dia?', caption: 'Um item simples para acompanhar trabalho, treino e deslocamentos. Confira medidas e condições no link.', callToAction: 'Ver detalhes', status: 'approved' },
  { id: 'creative-2', productId: 'prod-organizer', format: 'tiktok', hook: 'A transformação de mesa que cabe em poucos segundos', caption: 'Organize os pequenos itens sem ocupar a bancada inteira.', callToAction: 'Conhecer o produto', status: 'draft' },
  { id: 'creative-3', productId: 'prod-stand', format: 'story', hook: 'Mãos livres para trabalhar, assistir ou gravar', caption: 'Compare as opções e confira compatibilidade antes de comprar.', callToAction: 'Ver oferta', status: 'draft' },
];
