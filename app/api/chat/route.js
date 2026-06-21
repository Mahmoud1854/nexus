export async function POST(request) {
  const { messages } = await request.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured on server" }, { status: 500 });
  }

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages,
      stream: true,
    }),
  });

  if (!groqResponse.ok) {
    const errText = await groqResponse.text();
    return Response.json(
      { error: `Groq API failed (${groqResponse.status}): ${errText || "Unknown error"}` },
      { status: groqResponse.status }
    );
  }

  if (!groqResponse.body) {
    return Response.json({ error: "Groq response body is not readable" }, { status: 502 });
  }

  return new Response(groqResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
