'use client';

import React from 'react';
import { Radar, ShieldCheck, Database, Plus, Building2 } from 'lucide-react';

interface HeaderProps {
  productsCount: number;
  suppliersCount: number;
  onOpenAddProduct: () => void;
  onOpenAddSupplier: () => void;
}

export function Header({
  onOpenAddProduct,
  onOpenAddSupplier
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Radar className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  DropRadar <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">BR</span>
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Pesquisa pessoal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pesquisa com fontes, fornecedores e simulação de margem
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
            
            {/* Offline/LocalStorage Status Badge */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
              title="Persistência automática em localStorage: seus produtos e fornecedores ficam salvos no seu navegador mesmo sem Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Persistência:</span>
              <span className="font-semibold text-emerald-400">LocalStorage Ativo</span>
            </div>

            {/* Remessa Conforme Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300"
              title="Custos de importação devem vir de uma cotação atual"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Importação: <strong>usar cotação real</strong></span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button
                onClick={onOpenAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Produto</span>
              </button>

              <button
                onClick={onOpenAddSupplier}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Fornecedor</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
