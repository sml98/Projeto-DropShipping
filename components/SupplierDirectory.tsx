'use client';

import React, { useState, useMemo } from 'react';
import { Supplier } from '@/types';
import { 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  Star, 
  MessageCircle, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  Copy, 
  Check 
} from 'lucide-react';

interface SupplierDirectoryProps {
  suppliers: Supplier[];
  onOpenAddSupplierModal: () => void;
  initialSearch?: string;
}

export function SupplierDirectory({
  suppliers,
  onOpenAddSupplierModal,
  initialSearch = ''
}: SupplierDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [tabOrigin, setTabOrigin] = useState<'all' | 'nacional' | 'internacional'>('all');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const REQUIRED_WHATSAPP_MESSAGE = "Olá! Trabalho com dropshipping e gostaria de conhecer as condições de despacho individual do catálogo de vocês.";

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchesSearch =
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sup.tradeName && sup.tradeName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesOrigin = tabOrigin === 'all' || sup.origin === tabOrigin;

      return matchesSearch && matchesOrigin;
    });
  }, [suppliers, searchTerm, tabOrigin]);

  const getWhatsAppUrl = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(REQUIRED_WHATSAPP_MESSAGE)}`;
  };

  const copyMessageToClipboard = (id: string) => {
    navigator.clipboard.writeText(REQUIRED_WHATSAPP_MESSAGE);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Truck className="w-3.5 h-3.5" />
              Diretório com fontes
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Polos Logísticos & Fornecedores de Dropshipping
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Empresas com site oficial e seus cadastros pessoais. Confirme contrato, despacho unitário, nota fiscal, frete e atendimento antes de contratar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddSupplierModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* Message standard reminder card */}
      <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Abordagem Profissional Pré-Formatada:</span>
            <p className="text-emerald-300/80 italic mt-0.5">
              &quot;{REQUIRED_WHATSAPP_MESSAGE}&quot;
            </p>
          </div>
        </div>
        <span className="text-[11px] text-emerald-400 font-medium px-2.5 py-1 bg-emerald-500/10 rounded-lg whitespace-nowrap self-start sm:self-auto">
          Injetada com 1 clique no WhatsApp
        </span>
      </div>

      {/* Search & Tabs */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por fornecedor, polo logístico (Brás, Franca, Shenzhen) ou categoria de produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
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

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTabOrigin('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              tabOrigin === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-950'
            }`}
          >
            Todos os Polos ({suppliers.length})
          </button>

          <button
            onClick={() => setTabOrigin('nacional')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              tabOrigin === 'nacional'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-950'
            }`}
          >
            <span>🇧🇷 Fornecedores Nacionais (24h a 48h)</span>
          </button>

          <button
            onClick={() => setTabOrigin('internacional')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              tabOrigin === 'internacional'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-950'
            }`}
          >
            <span>🇨🇳 Fornecedores Internacionais (China / Global)</span>
          </button>
        </div>

      </div>

      {/* Suppliers List / Table */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">Nenhum fornecedor encontrado</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Não encontramos nenhum fornecedor correspondente ao termo digitado. Cadastre um novo parceiro agora mesmo!
          </p>
          <button
            onClick={onOpenAddSupplierModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-colors"
          >
            + Cadastrar Fornecedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSuppliers.map((supplier) => {
            const isNational = supplier.origin === 'nacional';

            return (
              <div
                key={supplier.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                
                <div className="space-y-3.5">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white hover:text-emerald-400 transition-colors">
                          {supplier.name}
                        </h3>
                        {supplier.verifiedBadge && (
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                            title="Fornecedor auditado com CNPJ e histórico de envio no prazo"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Verificado
                          </span>
                        )}
                        {supplier.isCustom && (
                          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            Cadastrado por você
                          </span>
                        )}
                      </div>
                      {supplier.tradeName && supplier.tradeName !== supplier.name && (
                        <p className="text-xs text-slate-400 mt-0.5">{supplier.tradeName}</p>
                      )}
                    </div>

                    {/* Origin Badge */}
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap ${
                      isNational
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {isNational ? '🇧🇷 Nacional' : '🌐 Internacional'}
                    </span>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                      <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase">Polo Logístico</span>
                        <span className="font-medium text-slate-200 truncate">{supplier.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800">
                      <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Prazo Despacho</span>
                        <span className="font-medium text-slate-200">{supplier.dispatchTime}</span>
                      </div>
                    </div>
                  </div>

                  {supplier.sourceUrl && <p className="text-xs text-emerald-300"><a href={supplier.sourceUrl} target="_blank" rel="noopener noreferrer">Fonte oficial consultada em {supplier.sourceCheckedAt}</a><br />Existência documentada; operação e entrega não auditadas.</p>}
                  {/* Description & Category */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {supplier.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">
                      Nicho: <strong className="text-slate-200">{supplier.category}</strong>
                    </span>

                    {/* Rating stars */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(supplier.rating ?? 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-slate-200 ml-1">
                        {supplier.rating == null ? 'Sem avaliação' : supplier.rating.toFixed(1)}
                      </span>
                      {supplier.reviewsCount && (
                        <span className="text-[11px] text-slate-500">
                          ({supplier.reviewsCount})
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  
                  {/* Catalog link if present */}
                  {supplier.catalogUrl ? (
                    <a
                      href={supplier.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Catálogo</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {supplier.minOrder}
                    </span>
                  )}

                  {/* WhatsApp Action with Preformatted Message */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => copyMessageToClipboard(supplier.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copiar mensagem padrão de abordagem"
                    >
                      {copiedIndex === supplier.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={supplier.whatsapp ? getWhatsAppUrl(supplier.whatsapp) : supplier.sourceUrl || supplier.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{supplier.whatsapp ? 'Chamar no WhatsApp' : 'Consultar fonte oficial'}</span>
                    </a>
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
