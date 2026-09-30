'use client';

import React, { useState } from 'react';
import { ChecklistStage, ChecklistSubtask } from '@/types';
import { saveStoredChecklist, resetStoredChecklist } from '@/lib/storage';
import { 
  CheckSquare, 
  Square, 
  Lightbulb, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Rocket, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Calculator,
  Truck
} from 'lucide-react';

interface LaunchChecklistProps {
  stages: ChecklistStage[];
  onUpdateStages: (stages: ChecklistStage[]) => void;
  onNavigateToTab: (tab: 'radar' | 'fornecedores' | 'calculadora' | 'ia') => void;
}

export function LaunchChecklist({
  stages,
  onUpdateStages,
  onNavigateToTab
}: LaunchChecklistProps) {
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
  });

  // Cálculo de progresso total
  let totalTasks = 0;
  let completedTasks = 0;

  stages.forEach((stage) => {
    stage.tasks.forEach((task) => {
      totalTasks++;
      if (task.completed) completedTasks++;
    });
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleTask = (stageId: number, taskId: string) => {
    const updated = stages.map((stage) => {
      if (stage.id !== stageId) return stage;
      return {
        ...stage,
        tasks: stage.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        })
      };
    });

    onUpdateStages(updated);
    saveStoredChecklist(updated);
  };

  const toggleStageExpand = (stageId: number) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const handleReset = () => {
    if (confirm('Deseja realmente reiniciar todo o checklist de lançamento?')) {
      const reset = resetStoredChecklist();
      onUpdateStages(reset);
    }
  };

  const getProgressMessage = (pct: number) => {
    if (pct === 100) return '🚀 Parabéns! Seu funil está 100% blindado e pronto para a primeira venda!';
    if (pct >= 80) return '🔥 Quase lá! Campanha e criativos prontos para tráfego pago!';
    if (pct >= 60) return '⚙️ Infraestrutura e loja avançadas. Hora de focar nos criativos!';
    if (pct >= 40) return '📦 Fornecedores e logística alinhados. Próximo passo: Página de Produto.';
    if (pct >= 20) return '💡 Produto validado! Avance para o alinhamento com o fornecedor.';
    return '🏁 Comece pela validação de margem e saturação do produto no mercado.';
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Rocket className="w-3.5 h-3.5" />
              Módulo de Execução Prática
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Checklist do Lançamento: Da Validação à Primeira Venda
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Siga o método passo a passo validado pelas maiores operações de dropshipping no Brasil para não queimar caixa e escalar com segurança.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar Checklist
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Progresso do Lançamento
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{completedTasks} de {totalTasks} tarefas concluídas</span>
              <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {progressPercent}%
              </span>
            </h3>
          </div>

          <p className="text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40">
            {getProgressMessage(progressPercent)}
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
          />
        </div>

        {/* Quick action shortcuts to complement the checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={() => onNavigateToTab('calculadora')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors text-left"
          >
            <Calculator className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <strong className="block text-white">Etapa 1: Validar Margem</strong>
              <span className="text-[10px] text-slate-400">Ir para Calculadora Remessa</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateToTab('fornecedores')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors text-left"
          >
            <Truck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <strong className="block text-white">Etapa 2: Fornecedores</strong>
              <span className="text-[10px] text-slate-400">Chamar no WhatsApp Oficial</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateToTab('ia')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <strong className="block text-white">Etapa 4: Gerar Copies</strong>
              <span className="text-[10px] text-slate-400">Roteiro 15s com Gemini IA</span>
            </div>
          </button>
        </div>

      </div>

      {/* 5 Stages Accordions */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isExpanded = !!expandedStages[stage.id];
          const stageCompletedCount = stage.tasks.filter((t) => t.completed).length;
          const stageTotal = stage.tasks.length;
          const isStageFinished = stageCompletedCount === stageTotal;

          return (
            <div
              key={stage.id}
              className={`bg-slate-900/80 border rounded-2xl overflow-hidden transition-all duration-200 ${
                isStageFinished
                  ? 'border-emerald-500/40 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Stage Header */}
              <button
                type="button"
                onClick={() => toggleStageExpand(stage.id)}
                className="w-full p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isStageFinished
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isStageFinished ? <CheckCircle2 className="w-5 h-5" /> : stage.id}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isStageFinished
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {stageCompletedCount} / {stageTotal}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Stage Tasks List */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3">
                  {stage.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(stage.id, task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        task.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {task.completed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <h4 className={`text-sm font-semibold ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {task.description}
                          </p>

                          {task.proTip && (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/30 flex items-start gap-2 text-xs text-amber-300/90">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{task.proTip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
