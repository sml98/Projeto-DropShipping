import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { productName, niche, audience, keyFeature } = await req.json();

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Se a chave não estiver configurada no ambiente local, fornecemos uma resposta inteligente de fallback
    if (!apiKey) {
      return NextResponse.json({
        data: {
          productName,
          title: `🔥 [NOVIDADE 2026] ${productName} - Tecnologia Original com Envio Expresso para Todo o Brasil`,
          painPoints: [
            `Frustração diária com produtos genéricos que quebram na primeira semana de uso`,
            `Gastos recorrentes e desnecessários sem resolver o problema de raiz com rapidez`,
            `Medo de comprar online e receber itens de baixa qualidade ou fora do padrão prometido`
          ],
          adCopy: `Você ainda está passando trabalho com isso? 🛑\n\nConheça o novo ${productName}! Projetado especificamente para quem não abre mão de praticidade, economia de tempo e durabilidade no dia a dia.\n\n✅ Envio Rápido com Rastreamento em Tempo Real\n✅ Estoque Seguro e Garantia Incondicional de 7 Dias\n✅ Mais de 3.400 clientes satisfeitos em todo o Brasil\n\n⚡ OFERTA EXCLUSIVA DESTA SEMANA: Desconto especial no PIX + Frete com Seguro incluso.\n\n👉 Clique em "Saiba Mais" e garanta o seu antes que o lote promocional acabe!`,
          videoScript: {
            hook: '00:00 - 00:03 | [CORTA RÁPIDO PARA O PROBLEMA] "Pare de perder tempo com isso! Se você ainda faz assim, está jogando dinheiro fora."',
            problem: '00:03 - 00:07 | [MOSTRA A FRUSTRAÇÃO] "Quantas vezes você já tentou resolver isso e acabou ficando estressado ou gastando o dobro?"',
            solution: '00:07 - 00:11 | [REVELAÇÃO DO PRODUTO EM AÇÃO] "Dá uma olhada nisso aqui: com o ' + productName + ', você resolve tudo em menos de 30 segundos, sem esforço."',
            callToAction: '00:11 - 00:15 | [TELA FINAL COM OFERTA] "O lote com desconto especial no PIX e envio prioritário tá acabando. Toca no botão aqui embaixo e pede o seu agora!"'
          }
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Você é o maior especialista em Copywriting e Tráfego Pago para Dropshipping no Brasil (com profundo conhecimento dos hábitos de compra do consumidor brasileiro, Meta Ads, TikTok Ads, checkout transparente e Pix).

Analise o seguinte produto e crie uma estrutura comercial de alta conversão:
- Nome do Produto: "${productName}"
- Nicho/Categoria: "${niche || 'Geral'}"
- Público-Alvo: "${audience || 'Consumidor Brasileiro'}"
- Diferencial: "${keyFeature || 'Qualidade superior e custo-benefício'}"

Retorne APENAS um JSON válido (sem tags markdown de código e sem texto antes ou depois) no seguinte formato estrito:
{
  "title": "Título comercial altamente persuasivo voltado para o comprador brasileiro (com gatilho de curiosidade/benefício)",
  "painPoints": [
    "Dor 1 que o produto resolve com urgência",
    "Dor 2 com impacto no bolso ou na rotina",
    "Dor 3 focada na frustração com métodos tradicionais"
  ],
  "adCopy": "Copy completa para anúncio de Instagram/Facebook Ads (com emojis, estrutura AIDA: Atenção, Interesse, Desejo, Ação e menção a Pix/Garantia)",
  "videoScript": {
    "hook": "00:00 - 00:03 (Gancho magnético de quebra de padrão para Reels/TikTok)",
    "problem": "00:03 - 00:07 (Agitação visual e verbal da dor principal)",
    "solution": "00:07 - 00:11 (Apresentação do produto em ação resolvendo o problema)",
    "callToAction": "00:11 - 00:15 (Chamada irresistível para clicar no link da loja com urgência)"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch {
      // Tenta extrair JSON se houver bloco de código
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Falha ao processar resposta do modelo.');
      }
    }

    return NextResponse.json({
      data: {
        productName,
        title: parsedData.title,
        painPoints: parsedData.painPoints,
        adCopy: parsedData.adCopy,
        videoScript: parsedData.videoScript
      }
    });

  } catch (err: unknown) {
    console.error('Erro na rota /api/gerar-oferta:', err);
    return NextResponse.json(
      { error: 'Não foi possível gerar a estrutura comercial no momento. Tente novamente.' },
      { status: 500 }
    );
  }
}
