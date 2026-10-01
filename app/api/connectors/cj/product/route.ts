import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/server/access';
import { getCjProduct } from '@/lib/server/cj';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const denied = guard(req, 'cj-product'); if (denied) return denied;
  const id = (req.nextUrl.searchParams.get('id') || '').trim();
  if (!/^[A-Za-z0-9-]{8,200}$/.test(id)) return NextResponse.json({ error: 'Produto CJ inválido.' }, { status: 400 });
  try { return NextResponse.json(await getCjProduct(id), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Falha na CJ.' }, { status: 502 }); }
}
