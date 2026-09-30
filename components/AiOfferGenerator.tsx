'use client';

import React, { useState } from 'react';
import { privateFetch } from '@/lib/client-api';
import { OfferStructure } from '@/types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle, 
  Video, 
  Target, 
  Loader2,
} from 'lucide-react';

interface AiOfferGeneratorProps {
  initialProductName?: string;
}

export function AiOfferGenerator({ initialProductName = '' }: AiOfferGeneratorProps) {
  const [productName, setProductName] = useState(initialProductName);
  const [niche, setNiche] = useState('Utilidades / Casa');
  const [targetAudience, setTargetAudience] = useState('Brasileiros buscando praticidade e custo-benefício');
  const [keyFeature, setKeyFeature] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<OfferStructure | null>(null);

  // Estados de cópia para cada seção
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2500);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim()) {
      setError('Por favor, informe o nome do produto para gerar a estrutura.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await privateFetch('/api/gerar-oferta', { productName: productName.trim(), niche, audience: targetAudience, keyFeature });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Erro ao comunicar com a inteligência artificial.');
      }

      setOffer(json.data);
    } catch (err: unknown) {
      console.error('Erro ao gerar oferta:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Não foi possível gerar a copy no momento. Tente novamente em alguns segundos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Engenharia de Conversão com Gemini IA
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Gerador de Estrutura Comercial de Alta Conversão
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Crie títulos magnéticos, agitação das 3 maiores dores, copy de anúncio completa (Meta Ads) e o roteiro de 15 segundos para Reels/TikTok adaptado aos gatilhos do consumidor brasileiro.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl h-fit">
          <h3 className="font-semibold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-4 h-4 text-amber-400" />
            Dados do Produto para a IA
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nome do Produto ou Link *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Tênis Ortopédico CloudWalk ou Mini Liquidificador Portátil"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nicho / Categoria
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Utilidades / Cozinha">Utilidades / Cozinha</option>
                  <option value="Calçados / Conforto">Calçados / Conforto</option>
                  <option value="Eletrônicos / Smart Home">Eletrônicos / Smart Home</option>
                  <option value="Beleza & Cuidados Pessoais">Beleza & Cuidados Pessoais</option>
                  <option value="Casa & Organização">Casa & Organização</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Foco do Características confirmadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alívio de dores, Bateria longa"
                  value={keyFeature}
                  onChange={(e) => setKeyFeature(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Público-Alvo Pretendido
              </label>
              <input
                type="text"
                placeholder="Ex: Homens e mulheres de 25-55 anos que trabalham em pé"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando Estrutura de Vendas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Estrutura de Venda com IA</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt Presets */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-2">Exemplos rápidos para testar:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Mini Liquidificador Portátil USB',
                'Tênis Ortopédico Respirável',
                'Câmera Smart WiFi 360°',
                'Organizador Giratório Acrílico'
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setProductName(ex)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          
          {!offer && !loading && (
            <div className="h-full min-h-[380px] bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg text-white">Nenhuma estrutura gerada ainda</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Informe o nome do produto ao lado e clique em &quot;Gerar Estrutura de Venda&quot;. A IA criará instantaneamente o título, as 3 dores, a copy para anúncios e o roteiro de vídeo de 15 segundos.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[380px] bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <div>
                <h4 className="font-semibold text-white text-base">Analisando o produto & gerando copies persuasivas...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Mapeando ganchos mentais, dores urgentes e roteiro com timing de 15 segundos para o público brasileiro.
                </p>
              </div>
            </div>
          )}

          {offer && !loading && (
            <div className="space-y-4">
              
              {/* Top Action / Success notice */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-semibold text-white">Estrutura Pronta para:</span>
                  <span className="text-xs text-amber-400 font-bold">{offer.productName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fullText = `TITULO:\n${offer.title}\n\n3 MAIORES DORES:\n${offer.painPoints.map((d, i) => `${i+1}. ${d}`).join('\n')}\n\nCOPY DO ANUNCIO:\n${offer.adCopy}\n\nROTEIRO DE VÍDEO 15s:\nGancho: ${offer.videoScript.hook}\nProblema: ${offer.videoScript.problem}\nResolução: ${offer.videoScript.solution}\nOferta: ${offer.videoScript.callToAction}`;
                    handleCopy(fullText, 'full');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  {copiedSection === 'full' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tudo Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Estrutura Completa</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1. TÍTULO COMERCIAL PERSUASIVO */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold">1</span>
                    <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                      Título Comercial Persuasivo
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.title, 'title')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'title' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sm font-semibold text-emerald-400 leading-snug">
                  {offer.title}
                </div>
              </div>

              {/* 2. AS 3 MAIORES DORES */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 text-xs font-bold">2</span>
                    <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                      As 3 Maiores Dores com Gatilhos de Urgência
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.painPoints.join('\n'), 'pains')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'pains' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'pains' ? 'Copiado!' : 'Copiar Dores'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {offer.painPoints.map((pain, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] flex-shrink-0 mt-0.5">
                        Dor #{idx + 1}
                      </span>
                      <span className="leading-relaxed">{pain}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. COPY DE ANÚNCIO (INSTAGRAM / META ADS) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">3</span>
                    <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                      Copy de Anúncio para Instagram / Facebook Ads
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.adCopy, 'adCopy')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'adCopy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'adCopy' ? 'Copiado!' : 'Copiar Copy'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                  {offer.adCopy}
                </pre>
              </div>

              {/* 4. ROTEIRO PASSO A PASSO DE VÍDEO (15 SEGUNDOS) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">4</span>
                    <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-400" />
                      Roteiro de Vídeo de 15 Segundos (Reels / TikTok)
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      const scriptText = `Gancho (0-3s): ${offer.videoScript.hook}\nProblema (3-7s): ${offer.videoScript.problem}\nResolução (7-11s): ${offer.videoScript.solution}\nOferta (11-15s): ${offer.videoScript.callToAction}`;
                      handleCopy(scriptText, 'videoScript');
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSection === 'videoScript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'videoScript' ? 'Copiado!' : 'Copiar Roteiro'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  {/* Gancho */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      ⚡ 00:00 - 00:03 | Gancho Magnético (Quebra de Padrão)
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {offer.videoScript.hook}
                    </p>
                  </div>

                  {/* Problema */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      ⚠️ 00:03 - 00:07 | Agitação da Dor Real
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {offer.videoScript.problem}
                    </p>
                  </div>

                  {/* Resolução */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      ✨ 00:07 - 00:11 | Resolução & Produto em Ação
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {offer.videoScript.solution}
                    </p>
                  </div>

                  {/* Chamada para Ação */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      🎯 00:11 - 00:15 | Oferta Irresistível & CTA
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {offer.videoScript.callToAction}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
