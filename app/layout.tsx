import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DropRadar BR | Inteligência para Dropshipping Híbrido',
  description: 'Ferramenta pessoal de pesquisa com fontes, diretório de fornecedores e simulação financeira de dropshipping.',
  openGraph: {
    title: 'DropRadar BR | Inteligência para Dropshipping Híbrido',
    description: 'Curadoria de produtos em alta, fornecedores nacionais e internacionais, calculadora com Remessa Conforme e gerador de ofertas com IA.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DropRadar BR | Inteligência para Dropshipping Híbrido',
    description: 'Curadoria de produtos em alta, fornecedores nacionais e internacionais e viabilidade financeira.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

