import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model, messages, max_tokens, temperature, stream, tools } = body;

    // Check if streaming is requested
    if (stream) {
      const response = await openai.chat.completions.create({
        model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: messages,
        stream: true,
        max_tokens: max_tokens,
        temperature: temperature ?? 0.7,
        tools: tools,
      });

      // Create a ReadableStream to stream the events to Vapi
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of response) {
              const text = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(text));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      const completion = await openai.chat.completions.create({
        model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: messages,
        stream: false,
        max_tokens: max_tokens,
        temperature: temperature ?? 0.7,
        tools: tools,
      });

      return Response.json(completion);
    }
  } catch (error: unknown) {
    console.error("Error in custom LLM:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    { success: true, data: "API is working 🚀" },
    { status: 200 }
  );
}