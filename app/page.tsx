'use client';

import React, { useState, useEffect } from 'react';
import { Product, Supplier, ChecklistStage } from '@/types';
import { 
  getStoredProducts, 
  addStoredProduct, 
  getStoredSuppliers, 
  addStoredSupplier, 
  getStoredChecklist 
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab } from '@/components/Navigation';
import { ProductRadar } from '@/components/ProductRadar';
import { SupplierDirectory } from '@/components/SupplierDirectory';
import { FinancialCalculator } from '@/components/FinancialCalculator';
import { AiOfferGenerator } from '@/components/AiOfferGenerator';
import { LaunchChecklist } from '@/components/LaunchChecklist';
import { ExportModal } from '@/components/ExportModal';
import { AddProductModal } from '@/components/AddProductModal';
import { AddSupplierModal } from '@/components/AddSupplierModal';
import { ResearchPanel } from '@/components/ResearchPanel';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_CHECKLIST_STAGES } from '@/lib/data/seedData';
import { ShieldCheck, Database } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [checklistStages, setChecklistStages] = useState<ChecklistStage[]>(INITIAL_CHECKLIST_STAGES);

  useEffect(() => {
    setProducts(getStoredProducts());
    setSuppliers(getStoredSuppliers());
    setChecklistStages(getStoredChecklist());
  }, []);

  // Modals state
  const [exportProduct, setExportProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // Cross-module states
  const [calcProduct, setCalcProduct] = useState<Product | null>(null);
  const [aiProductName, setAiProductName] = useState<string>('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState<string>('');

  // Handlers for adding new items with localStorage persistence
  const handleAddProduct = (newProd: Product) => {
    const updated = addStoredProduct(newProd);
    setProducts(updated);
  };

  const handleAddSupplier = (newSup: Supplier) => {
    const updated = addStoredSupplier(newSup);
    setSuppliers(updated);
  };

  // Switch to Calculator with product data
  const handleSelectForCalc = (product: Product) => {
    setCalcProduct(product);
    setActiveTab('calculadora');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to AI Generator with product name
  const handleSelectForAi = (product: Product) => {
    setAiProductName(product.name);
    setActiveTab('ia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Suppliers tab from product card
  const handleViewSupplier = (supplierName: string) => {
    setSupplierSearchQuery(supplierName);
    setActiveTab('fornecedores');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate checklist progress percentage
  let totalTasks = 0;
  let completedTasks = 0;
  checklistStages.forEach((s) => {
    s.tasks.forEach((t) => {
      totalTasks++;
      if (t.completed) completedTasks++;
    });
  });
  const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 sm:pb-12">
      
      {/* Top Header */}
      <Header
        productsCount={products.length}
        suppliersCount={suppliers.length}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
      />

      {/* Main Navigation (Tabs) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        checklistProgress={checklistProgress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <ResearchPanel />

        {/* Module 1: Radar em Alta */}
        {activeTab === 'radar' && (
          <ProductRadar
            products={products}
            onSelectForCalculation={handleSelectForCalc}
            onSelectForAi={handleSelectForAi}
            onOpenExportModal={(p) => setExportProduct(p)}
            onOpenAddProductModal={() => setIsAddProductOpen(true)}
            onViewSupplierDetails={handleViewSupplier}
          />
        )}

        {/* Module 2: Fornecedores */}
        {activeTab === 'fornecedores' && (
          <SupplierDirectory
            suppliers={suppliers}
            onOpenAddSupplierModal={() => setIsAddSupplierOpen(true)}
            initialSearch={supplierSearchQuery}
          />
        )}

        {/* Module 3: Calculadora */}
        {activeTab === 'calculadora' && (
          <FinancialCalculator
            key={calcProduct?.id || 'default'}
            initialProduct={calcProduct}
            onNavigateToAi={(pName) => {
              setAiProductName(pName);
              setActiveTab('ia');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Module 4: IA Generator */}
        {activeTab === 'ia' && (
          <AiOfferGenerator
            initialProductName={aiProductName}
          />
        )}

        {/* Module 5: Checklist Lançamento */}
        {activeTab === 'checklist' && (
          <LaunchChecklist
            stages={checklistStages}
            onUpdateStages={(updated) => setChecklistStages(updated)}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Modals */}
      <ExportModal
        product={exportProduct}
        isOpen={!!exportProduct}
        onClose={() => setExportProduct(null)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onAddSupplier={handleAddSupplier}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">DropRadar BR</span>
            <span>•</span>
            <span>Inteligência de Mercado & Viabilidade para Dropshipping no Brasil</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              Persistência LocalStorage Ativa
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Fontes rastreáveis; cotações a confirmar
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
