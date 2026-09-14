// Guardião do Véu — respostas geradas por IA (Gemini).
//
// Roda no servidor do Supabase para que a GEMINI_API_KEY nunca chegue ao
// navegador do usuário. Configurada como secret do projeto (nunca no código
// nem no repositório): supabase secrets set GEMINI_API_KEY=...
//
// Se a chamada ao Gemini falhar por qualquer motivo (cota, rede, chave
// ausente), devolve { fallback: true } para o front-end usar as respostas
// pré-escritas locais em vez de mostrar erro ao usuário.

const CATEGORY_LABELS: Record<string, string> = {
  ervas: "Ervas & Rituais",
  orixas: "Orixás, Guias & Santos",
  astrologia: "Astrologia",
  correspondencias: "Correspondências Mágicas",
  geral: "Pergunta Geral",
};

const SYSTEM_INSTRUCTION = `Você é "O Guardião do Véu", um oráculo místico dentro do aplicativo Arcanum,
uma rede social para praticantes de tradições esotéricas (Umbanda, Quimbanda, Candomblé, Bruxaria,
Hermetismo, Astrologia, etc). Responda em português do Brasil, em 1 a 3 frases curtas, em tom
poético mas direto, como um guia espiritual experiente — nunca como um chatbot genérico.
Nunca dê conselhos médicos, financeiros ou legais como se fossem garantias; se a pergunta tocar
nesses temas, responda pelo lado simbólico/espiritual e sugira buscar um profissional para a parte prática.
Não use saudações nem se apresente — responda direto à pergunta.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, category } = await req.json();

    if (typeof question !== "string" || !question.trim()) {
      return new Response(JSON.stringify({ error: "missing_question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanQuestion = question.trim().slice(0, 300);
    const categoryLabel = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.geral;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ fallback: true, reason: "no_api_key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Categoria: ${categoryLabel}\nPergunta de um buscador: "${cleanQuestion}"`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
          // thinkingBudget:0 desliga o raciocínio interno do modelo, que por padrão
          // consome centenas de tokens "invisíveis" mesmo em respostas curtas.
          generationConfig: { temperature: 0.9, maxOutputTokens: 150, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error("Gemini error", geminiRes.status, await geminiRes.text());
      return new Response(JSON.stringify({ fallback: true, reason: "gemini_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const answer: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return new Response(JSON.stringify({ fallback: true, reason: "empty_response" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("guardian-ai error", err);
    return new Response(JSON.stringify({ fallback: true, reason: "exception" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
