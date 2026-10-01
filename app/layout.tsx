import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DropRadar OS | Commerce Intelligence',
  description: 'Central de prospecção, comparação, curadoria, catálogo e operação para dropshipping nacional e internacional.',
  openGraph: {
    title: 'DropRadar OS | Commerce Intelligence',
    description: 'Compare ofertas, aprove produtos e publique uma vitrine com fontes e custos rastreáveis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DropRadar OS | Commerce Intelligence',
    description: 'Prospecção, comparação, curadoria e operação de catálogo.',
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
