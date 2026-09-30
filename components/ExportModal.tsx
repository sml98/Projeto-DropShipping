'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { formatCurrencyBRL } from '@/lib/calculator';
import { X, Download, FileText, FileCode, Check, Copy } from 'lucide-react';

interface ExportModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ product, isOpen, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  if (!isOpen || !product) return null;

  // Gerar dados estruturados para o JSON
  const exportData = {
    title: product.name,
    suggestedPrice: product.suggestedPrice,
    supplierCost: product.supplierCost,
    estimatedFreight: product.estimatedFreight,
    category: product.category,
    niche: product.niche,
    origin: product.origin === 'nacional' ? 'Estoque Nacional (Brasil)' : 'Importação Exclusiva (Remessa Conforme)',
    deliveryTime: product.deliveryTime,
    supplier: {
      name: product.supplierName,
      location: product.supplierLocation
    },
    description: product.description,
    painPoints: product.painPoints || [],
    marketingAngles: [
      `Foco em resolver: ${product.painPoints?.[0] || 'Praticidade no dia a dia'}`,
      'Garantia de 7 dias e envio com código de rastreamento',
      'Desconto exclusivo no pagamento via PIX'
    ],
    exportedAt: new Date().toISOString(),
    sourcePlatform: 'DropRadar BR'
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  // Gerar CSV compatível com importação
  const csvHeaders = ['Titulo', 'Preco_Venda_Sugerido', 'Custo_Fornecedor', 'Frete_Estimado', 'Categoria', 'Nicho', 'Origem', 'Prazo_Entrega', 'Fornecedor', 'Descricao'];
  const csvValues = [
    `"${product.name.replace(/"/g, '""')}"`,
    product.suggestedPrice.toFixed(2),
    product.supplierCost.toFixed(2),
    product.estimatedFreight.toFixed(2),
    `"${product.category}"`,
    `"${product.niche}"`,
    `"${product.origin === 'nacional' ? 'Estoque Nacional' : 'Internacional (Remessa Conforme)'}"`,
    `"${product.deliveryTime}"`,
    `"${product.supplierName}"`,
    `"${product.description.replace(/"/g, '""')}"`
  ];
  const csvString = `${csvHeaders.join(';')}\n${csvValues.join(';')}`;

  const handleDownload = () => {
    const isJson = format === 'json';
    const content = isJson ? jsonString : csvString;
    const mimeType = isJson ? 'application/json' : 'text/csv;charset=utf-8;';
    const extension = isJson ? 'json' : 'csv';
    const filename = `dropradar_${product.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.${extension}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = format === 'json' ? jsonString : csvString;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Exportar Produto para Loja</h3>
              <p className="text-xs text-slate-400">Gere um arquivo estruturado para cadastrar na sua plataforma (Shopify, Nuvemshop, Yampi)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Product Summary */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-slate-200 truncate">{product.name}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span>Preço Sugerido: <strong className="text-emerald-400">{formatCurrencyBRL(product.suggestedPrice)}</strong></span>
                <span>•</span>
                <span>Categoria: <strong className="text-slate-300">{product.category}</strong></span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Escolha o Formato:</label>
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  format === 'json'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                JSON Estruturado
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                CSV (Planilhas & Importador)
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Prévia do conteúdo:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed select-all">
              {format === 'json' ? jsonString : csvString}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Baixar Arquivo {format.toUpperCase()}
          </button>
        </div>

      </div>
    </div>
  );
}
