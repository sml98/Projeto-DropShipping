'use client';

import React, { useState } from 'react';
import { Supplier, OriginType } from '@/types';
import { X, UserPlus, Building2 } from 'lucide-react';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export function AddSupplierModal({ isOpen, onClose, onAddSupplier }: AddSupplierModalProps) {
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [origin, setOrigin] = useState<OriginType>('nacional');
  const [category, setCategory] = useState('Utilidades Gerais');
  const [location, setLocation] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !catalogUrl.trim()) return;

    // Remove caracteres não numéricos do telefone
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const formattedPhone = cleanPhone ? (origin === 'nacional' && !cleanPhone.startsWith('55') ? `55${cleanPhone}` : cleanPhone) : '';

    const newSupplier: Supplier = {
      id: `custom-sup-${Date.now()}`,
      name: name.trim(),
      tradeName: tradeName.trim() || name.trim(),
      origin,
      category,
      location: location.trim(),
      dispatchTime: dispatchTime.trim() || 'Não informado',

      minOrder: 'Condições a confirmar',
      whatsapp: formattedPhone,
      catalogUrl: catalogUrl.trim() || undefined,
      description: description.trim() || 'Cadastro manual. Condições de dropshipping a confirmar.',
      sourceUrl: catalogUrl.trim(),
      sourceCheckedAt: new Date().toISOString(),
      verifiedBadge: false,
      verificationStatus: 'manual',
      isCustom: true
    };

    if (catalogUrl && !/^https:\/\//i.test(catalogUrl)) return;
    onAddSupplier(newSupplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Cadastrar Novo Fornecedor</h3>
              <p className="text-xs text-slate-400">Cadastro pessoal no navegador; faça backup regularmente</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Fornecedor / Contato *</label>
              <input
                type="text"
                required
                placeholder="Ex: Confecções Brás Atacado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Razão Social / Nome Fantasia</label>
              <input
                type="text"
                placeholder="Ex: Brás Têxtil Distribuição Ltda"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Origem</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('nacional');
                    setLocation('São Paulo - SP');
                    setDispatchTime('24h a 48h');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    origin === 'nacional'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  🇧🇷 Nacional
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('internacional');
                    setLocation('Shenzhen - China');
                    setDispatchTime('7 a 12 dias');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    origin === 'internacional'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  🇨🇳 Internacional
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Categoria Principal</label>
              <input
                type="text"
                placeholder="Ex: Moda Íntima, Eletrônicos, Calçados"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Polo Logístico / Cidade</label>
              <input
                type="text"
                placeholder="Ex: Franca - SP, Brás - SP, Shenzhen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prazo Médio de Despacho</label>
              <select
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="24h a 48h">24h a 48h (Nacional Ágil)</option>
                <option value="No mesmo dia (até 11h)">No mesmo dia (até 11h)</option>
                <option value="2 a 4 dias">2 a 4 dias úteis</option>
                <option value="7 a 12 dias">7 a 12 dias (Internacional Direto)</option>
                <option value="10 a 15 dias">10 a 15 dias (Remessa Conforme)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp comercial confirmado (opcional)</label>
              <input
                type="text"
                placeholder="Ex: 11999998888 ou 5511999998888"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">O link usará a mensagem padrão de abordagem de dropshipping</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Site oficial / catálogo (obrigatório)</label>
              <input
                type="url"
                required
                pattern="https://.*"
                placeholder="https://drive.google.com/... ou site"
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Observações / Detalhes de Despacho</label>
            <textarea
              rows={2}
              placeholder="Ex: Emite nota fiscal com a chave do lojista, usa etiquetas dos Correios e Jadlog."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              Cadastrar Fornecedor
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
