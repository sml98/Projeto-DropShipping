'use client';

import React from 'react';
import { 
  TrendingUp, 
  Truck, 
  Calculator, 
  Sparkles, 
  CheckSquare 
} from 'lucide-react';

export type ActiveTab = 'radar' | 'fornecedores' | 'calculadora' | 'ia' | 'checklist';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  checklistProgress: number; // percentage 0-100
}

export function Navigation({ activeTab, onTabChange, checklistProgress }: NavigationProps) {
  const tabs = [
    {
      id: 'radar' as ActiveTab,
      label: 'Radar em Alta',
      sublabel: 'Produtos Validados',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      id: 'fornecedores' as ActiveTab,
      label: 'Fornecedores',
      sublabel: 'Diretório Verificado',
      icon: Truck,
      color: 'blue',
    },
    {
      id: 'calculadora' as ActiveTab,
      label: 'Calculadora Lucro',
      sublabel: 'Remessa Conforme',
      icon: Calculator,
      color: 'purple',
    },
    {
      id: 'ia' as ActiveTab,
      label: 'Gerador IA',
      sublabel: 'Copy & Roteiro 15s',
      icon: Sparkles,
      color: 'amber',
    },
    {
      id: 'checklist' as ActiveTab,
      label: 'Checklist Lançamento',
      sublabel: '5 Etapas Guiadas',
      icon: CheckSquare,
      color: 'emerald',
      badge: `${checklistProgress}%`
    }
  ];

  return (
    <>
      {/* Desktop / Tablet Nav Tabs */}
      <nav className="hidden sm:block border-b border-slate-800 bg-slate-900/40 sticky top-[73px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? tab.id === 'radar' 
                        ? 'text-emerald-400' 
                        : tab.id === 'fornecedores' 
                          ? 'text-blue-400' 
                          : tab.id === 'calculadora' 
                            ? 'text-purple-400' 
                            : tab.id === 'ia' 
                              ? 'text-amber-400' 
                              : 'text-emerald-400'
                      : 'text-slate-400'
                  }`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-5 gap-1 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-medium transition-all relative ${
                  isActive
                    ? 'text-emerald-400 bg-slate-900/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-emerald-500 text-slate-950 px-1 rounded-full leading-tight">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[58px] leading-tight">
                  {tab.id === 'checklist' ? 'Checklist' : tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
