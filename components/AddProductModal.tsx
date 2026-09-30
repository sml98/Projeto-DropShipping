'use client';

import React, { useState } from 'react';
import { Product, OriginType } from '@/types';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export function AddProductModal({ isOpen, onClose, onAddProduct }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Utilidades');
  const [niche, setNiche] = useState('Casa & Dia a Dia');
  const [origin, setOrigin] = useState<OriginType>('nacional');
  const [supplierCost, setSupplierCost] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [estimatedFreight, setEstimatedFreight] = useState('18.00');
  const [supplierName, setSupplierName] = useState('');
  const [supplierLocation, setSupplierLocation] = useState('São Paulo - SP');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !supplierCost || !suggestedPrice) return;

    const costNum = parseFloat(supplierCost.replace(',', '.')) || 0;
    const priceNum = parseFloat(suggestedPrice.replace(',', '.')) || 0;
    const freightNum = parseFloat(estimatedFreight.replace(',', '.')) || 0;

    const grossMargin = priceNum > 0 ? ((priceNum - costNum) / priceNum) * 100 : 0;

    const defaultImage = origin === 'nacional'
      ? 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

    const newProd: Product = {
      id: `custom-prod-${Date.now()}`,
      name: name.trim(),
      category,
      niche,
      origin,
      originBadge: origin === 'nacional' ? 'Estoque Brasil (3 a 6 dias)' : 'Importação Exclusiva (10 a 15 dias)',
      deliveryTime: origin === 'nacional' ? '2 a 5 dias úteis' : '10 a 15 dias úteis',
      imageUrl: imageUrl.trim() || defaultImage,
      supplierCost: costNum,
      suggestedPrice: priceNum,
      estimatedFreight: freightNum,
      grossMargin: parseFloat(grossMargin.toFixed(1)),
      supplierName: supplierName.trim() || 'Fornecedor Parceiro Cadastrado',
      supplierLocation: supplierLocation.trim() || (origin === 'nacional' ? 'Brasil' : 'China'),
      description: description.trim() || 'Produto com alta margem e demanda validada para dropshipping.',
      painPoints: [
        'Problema recorrente que gera busca imediata no Google e redes',
        'Custo elevado de marcas tradicionais similares',
        'Necessidade de entrega confiável com código de rastreamento'
      ],
      trendingScore: 90,
      salesVolumeEstimate: '+1.500 vendas/mês',
      isCustom: true
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Adicionar Produto ao Radar</h3>
              <p className="text-xs text-slate-400">Os dados serão salvos no localStorage do seu navegador</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Produto *</label>
            <input
              type="text"
              required
              placeholder="Ex: Escova Elétrica Alisadora Íons Negativos 3 em 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Utilidades">Utilidades</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Moda & Calçados">Moda & Calçados</option>
                <option value="Casa">Casa & Decoração</option>
                <option value="Beleza & Saúde">Beleza & Saúde</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Origem do Estoque</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrigin('nacional')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    origin === 'nacional'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  🇧🇷 Nacional (24h)
                </button>
                <button
                  type="button"
                  onClick={() => setOrigin('internacional')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    origin === 'internacional'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  🇨🇳 China / Global
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Custo no Fornecedor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 35.00"
                value={supplierCost}
                onChange={(e) => setSupplierCost(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preço Sugerido (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 129.90"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Frete Médio (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 18.00"
                value={estimatedFreight}
                onChange={(e) => setEstimatedFreight(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Fornecedor</label>
              <input
                type="text"
                placeholder="Ex: Distribuidora Central SP"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Polo Logístico / Cidade</label>
              <input
                type="text"
                placeholder="Ex: Brás - SP ou Franca - SP"
                value={supplierLocation}
                onChange={(e) => setSupplierLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">URL da Imagem (Opcional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Descrição Curta / Diferencial</label>
            <textarea
              rows={2}
              placeholder="Ex: Produto viral no TikTok com alta procura e boa aceitação de pagamento via PIX."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Salvar no Radar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
