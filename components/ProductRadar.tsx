'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { formatCurrencyBRL, formatPercentBR } from '@/lib/calculator';
import { 
  Search, 
  Filter, 
  Calculator, 
  Download, 
  Sparkles, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Tag, 
  ExternalLink,
  PlusCircle,
  Truck
} from 'lucide-react';

interface ProductRadarProps {
  products: Product[];
  onSelectForCalculation: (product: Product) => void;
  onSelectForAi: (product: Product) => void;
  onOpenExportModal: (product: Product) => void;
  onOpenAddProductModal: () => void;
  onViewSupplierDetails: (supplierName: string) => void;
}

export function ProductRadar({
  products,
  onSelectForCalculation,
  onSelectForAi,
  onOpenExportModal,
  onOpenAddProductModal,
  onViewSupplierDetails
}: ProductRadarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState<'all' | 'nacional' | 'internacional'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOrigin = 
        originFilter === 'all' || p.origin === originFilter;

      const matchesCategory = 
        categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesOrigin && matchesCategory;
    });
  }, [products, searchTerm, originFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Info */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Tendências Híbridas Atualizadas
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Radar de Produtos em Alta no Brasil
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Produtos minerados com alta margem e demanda comprovada. Alterne entre pronta entrega no Brasil (envio em 24h) e importação exclusiva compatível com a Remessa Conforme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddProductModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar Produto ao Radar
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do produto, nicho (ex: Cozinha, Eletrônicos, Calçados) ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Quick Origin Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Origem:
            </span>

            <button
              onClick={() => setOriginFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                originFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              Todos ({products.length})
            </button>

            <button
              onClick={() => setOriginFilter('nacional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                originFilter === 'nacional'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Estoque Nacional (Envio 24h)
            </button>

            <button
              onClick={() => setOriginFilter('internacional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                originFilter === 'internacional'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-slate-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Importação Exclusiva (China)
            </button>
          </div>

          {/* Category Dropdown/Chips */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Nicho:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">Todas as Categorias</option>
              {categories.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Tente ajustar os filtros de busca ou adicione um novo produto minerado diretamente ao radar.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setOriginFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isNational = product.origin === 'nacional';
            const grossProfitVal = product.suggestedPrice - product.supplierCost;

            return (
              <div
                key={product.id}
                className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 relative"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Origin Tag */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {isNational ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-slate-950 backdrop-blur-md shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                        {product.originBadge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/90 text-white backdrop-blur-md shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        {product.originBadge}
                      </span>
                    )}

                    {product.salesVolumeEstimate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                        🔥 {product.salesVolumeEstimate}
                      </span>
                    )}
                  </div>

                  {/* Category Chip */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Delivery SLA overlay */}
                  <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Entrega: {product.deliveryTime}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div>
                    <h3 className="font-semibold text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                      {product.description}
                    </p>
                  </div>

                  {/* Supplier Info Link */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium truncate">{product.supplierName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewSupplierDetails(product.supplierName)}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium flex items-center gap-1 flex-shrink-0 ml-2"
                    >
                      <span>Ver Polo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Custo Forn.</span>
                      <span className="font-bold text-sm text-slate-200">{formatCurrencyBRL(product.supplierCost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preço Sugerido</span>
                      <span className="font-bold text-sm text-emerald-400">{formatCurrencyBRL(product.suggestedPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Margem Bruta</span>
                      <span className="font-bold text-sm text-teal-300">{formatPercentBR(product.grossMargin)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Calcular Lucro */}
                      <button
                        type="button"
                        onClick={() => onSelectForCalculation(product)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                        title="Injeta os dados na Calculadora com cálculo de Remessa Conforme se internacional"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Calcular Lucro</span>
                      </button>

                      {/* Exportar para Loja (Download JSON/CSV) */}
                      <button
                        type="button"
                        onClick={() => onOpenExportModal(product)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer"
                        title="Baixar JSON ou CSV para importar no Shopify, Nuvemshop ou Yampi"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Exportar Loja</span>
                      </button>
                    </div>

                    {/* Gerar Copy com IA */}
                    <button
                      type="button"
                      onClick={() => onSelectForAi(product)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Gerar Estrutura Comercial com IA</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
