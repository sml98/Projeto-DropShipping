import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/server/access';
import { searchCjProducts } from '@/lib/server/cj';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const denied = guard(req, 'cj-search'); if (denied) return denied;
  const query = (req.nextUrl.searchParams.get('q') || '').trim();
  if (query.length < 2 || query.length > 120) return NextResponse.json({ error: 'Informe uma busca de 2 a 120 caracteres.' }, { status: 400 });
  try { return NextResponse.json(await searchCjProducts(query), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Falha na CJ.' }, { status: 502 }); }
}
